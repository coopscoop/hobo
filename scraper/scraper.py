#!/usr/bin/env python3

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import csv
import random
import os
import time

USERNAME = "mac87eng@gmail.com"
PASSWORD = "H0b0B@seb@!!"
BASE_URL = "https://www.leaguelineup.com"

# Delay range (seconds) between game stats requests.
# Keeps the session alive and avoids tripping the server - happened when i just hammered with all my requests
REQUEST_DELAY = (1.5, 3.0)

# Output files — all stats scrapes append to these so a resume picks up
# exactly where it left off without duplicating rows.
OUT_INNINGS = "innings.csv"
OUT_BATTING = "batting.csv"
OUT_METADATA = "game_metadata.csv"

# Checkpoint file — stores the last successfully scraped game ID index - if something goes wrong it knows where it stopped
CHECKPOINT = "checkpoint.txt"


def login(page):
    page.goto(
        "https://login.stacksports.com/login"
        "?client_id=5d712434a2506ba69cfc60b7"
        "&redirect_uri=http://www.leaguelineup.com/login.asp?url=hobo"
        "&register_uri=http://www.leaguelineup.com/login.asp?url="
        "&nw=1"
    )
    page.wait_for_selector("input[name='username']")
    page.fill("input[name='username']", USERNAME)
    page.fill("input[name='password']", PASSWORD)
    page.click("button[type='submit']")
    page.wait_for_load_state("networkidle")
    print("Logged in! Current URL:", page.url)


def is_session_alive(page):
    # Hits the admin home page and checks we're still authenticated.
    # If we've been logged out we'll land on a login page.
    page.goto(f"{BASE_URL}/adminmain.asp?url=hobo")
    page.wait_for_load_state("networkidle")
    return "login" not in page.url.lower() and "adminmain" in page.url.lower()


def relogin(page):
    # Called when the session has expired mid-scrape.
    print("  Session expired, re-logging in...")
    login(page)
    print("  Re-login successful, resuming...")


def read_checkpoint():
    # Returns the index of the last successfully completed game, or -1 if none.
    if not os.path.exists(CHECKPOINT):
        return -1
    with open(CHECKPOINT) as f:
        val = f.read().strip()
        return int(val) if val else -1


def write_checkpoint(index):
    # Writes the index of the last successfully completed game.
    with open(CHECKPOINT, "w") as f:
        f.write(str(index))


def append_csv(file_name, rows, write_header=False, header=None):
    # Appends rows to a CSV, optionally writing a header first.
    # Used for incremental writes so progress isn't lost on crash.
    mode = "a" if os.path.exists(file_name) and not write_header else "w"
    with open(file_name, mode, newline="") as f:
        writer = csv.writer(f)
        if write_header and header:
            writer.writerow(header)
        writer.writerows(rows)


def write_csv(file_name, content):
    with open(file_name, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(content)


def scrape_news(page):
    # Returns the news admin list as rows: [sort, id, title, date, actions]
    URL = f"{BASE_URL}/news_adminlist.asp?url=hobo&pagetype=1"
    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.wait_for_selector("table#sort")

    soup = BeautifulSoup(page.content(), "html.parser")
    table = soup.select_one("table#sort")

    headers = [th.get_text(strip=True) for th in table.select("thead th")]
    rows = [headers]
    for tr in table.select("tbody tr"):
        cols = [td.get_text(strip=True) for td in tr.find_all("td")]
        if cols:
            rows.append(cols)

    return rows


def scrape_news_content(page, article_id):
    # Returns [article_id, title, content, last_updated] for a single article.
    URL = f"{BASE_URL}/admin_itemedit.asp?url=hobo&ItemID={article_id}&widget=0"
    page.goto(URL)
    page.wait_for_load_state("networkidle")

    soup = BeautifulSoup(page.content(), "html.parser")
    title = soup.find("input", {"name": "ShortDesc"})["value"]
    content = soup.find("textarea", {"name": "articlecontent"}).get_text()
    last_updated = soup.find("small").get_text(strip=True)

    return [article_id, title, content, last_updated]


def scrape_divisions(page):
    # Returns all divisions: [order, division_id, division_name, teams_assigned]
    URL = f"{BASE_URL}/division_adminlist.asp?url=hobo"
    page.goto(URL)
    page.wait_for_load_state("networkidle")

    soup = BeautifulSoup(page.content(), "html.parser")
    table = soup.select_one("table.editor.itemlist")
    if not table:
        return []

    rows = [["Order", "Division ID", "Division Name", "Teams Assigned"]]
    for tr in table.select("tbody tr"):
        cols = tr.find_all("td")
        if not cols:
            continue

        order = cols[0].get_text(strip=True)
        name_tag = cols[1].find("a")
        name = (
            name_tag.get_text(strip=True) if name_tag else cols[1].get_text(strip=True)
        )
        href = name_tag["href"] if name_tag else ""
        division_id = href.split("divisionid=")[-1] if "divisionid=" in href else ""
        teams = cols[2].get_text(strip=True)

        rows.append([order, division_id, name, teams])

    return rows


def scrape_teams(page, divisions):
    # Returns all teams across all divisions: [team_id, team_name, players_assigned, division_id]
    rows = [["Team ID", "Team Name", "Players Assigned", "Division ID"]]

    for division in divisions[1:]:
        division_id = division[1]
        URL = f"{BASE_URL}/team_adminlist.asp?url=hobo&divisionid={division_id}"
        page.goto(URL)
        page.wait_for_load_state("networkidle")

        soup = BeautifulSoup(page.content(), "html.parser")
        table = soup.select_one("table.editor.itemlist")
        if not table:
            continue

        for tr in table.select("tbody tr"):
            cols = tr.find_all("td")
            if not cols:
                continue

            name_tag = cols[0].find("a")
            if not name_tag:
                continue

            name = name_tag.get_text(strip=True)
            href = name_tag.get("href", "")
            team_id = href.split("teamid=")[-1] if "teamid=" in href else ""
            players = cols[1].get_text(strip=True)

            rows.append([team_id, name, players, division_id])

    return rows


def scrape_players(page):
    # Returns all players across all pages: [player_id, last_name, first_name, number, division, team]
    # Iterates through pagination until the next button is disabled.
    URL = f"{BASE_URL}/player_adminlist.asp?url=hobo&divisionid=1"
    page.goto(URL)
    page.wait_for_load_state("networkidle")

    rows = [["Player ID", "Last Name", "First Name", "Number", "Division", "Team"]]

    while True:
        soup = BeautifulSoup(page.content(), "html.parser")
        table = soup.select_one("table#players")
        if not table:
            break

        for tr in table.select("tbody tr"):
            cols = tr.find_all("td")
            if not cols:
                continue

            player_id_input = cols[0].find(
                "input", {"id": lambda x: x and x.startswith("playerid_")}
            )
            player_id = player_id_input["value"] if player_id_input else ""
            last_name = cols[1].get_text(strip=True)
            first_name = cols[2].get_text(strip=True)
            number = cols[3].get_text(strip=True).replace("\xa0", "")
            division = cols[4].get_text(strip=True).replace("\xa0", "")
            team = cols[5].get_text(strip=True).replace("\xa0", "")

            rows.append([player_id, last_name, first_name, number, division, team])

        next_btn = page.query_selector("#players_next")
        if "disabled" in (next_btn.get_attribute("class") or ""):
            break

        next_btn.click()
        page.wait_for_load_state("networkidle")

    return rows


def scrape_game_ids(page, divisions):
    # Returns all games across all divisions from the results list.
    # Columns: game_id, date, status, visitors, home, location, division_id, division_name
    # Status includes the final score when completed, e.g. "F 8-1".
    rows = [
        [
            "Game ID",
            "Date",
            "Status",
            "Visitors",
            "Home",
            "Location",
            "Division ID",
            "Division Name",
        ]
    ]

    for division in divisions[1:]:
        division_id = division[1]
        division_name = division[2]

        URL = f"{BASE_URL}/lpadmin_resultslist.asp?url=hobo&divisionid={division_id}"
        page.goto(URL)
        page.wait_for_load_state("networkidle")

        soup = BeautifulSoup(page.content(), "html.parser")
        table = soup.select_one("table.editor.itemlist")
        if not table:
            print(
                f"  division {division_name} ({division_id}): no table found, skipping"
            )
            continue

        division_rows = 0
        for tr in table.select("tbody tr"):
            cols = tr.find_all("td")
            # columns: date, time, status, visitors, home, location, edit
            if not cols or len(cols) < 7:
                continue

            edit_link = cols[-1].find("a", href=True)
            if not edit_link:
                continue

            href = edit_link["href"]
            game_id = href.split("gameid=")[-1] if "gameid=" in href else ""
            if not game_id:
                continue

            date = cols[0].get_text(strip=True)
            status = cols[2].get_text(strip=True)
            visitors = cols[3].get_text(strip=True)
            home = cols[4].get_text(strip=True)
            location = cols[5].get_text(strip=True)

            rows.append(
                [
                    game_id,
                    date,
                    status,
                    visitors,
                    home,
                    location,
                    division_id,
                    division_name,
                ]
            )
            division_rows += 1

        print(f"  division {division_name} ({division_id}): {division_rows} games")

    return rows


def scrape_game_stats(page, game_id, referrer_division_id=None):
    # Visits the offensive stats page for a single game and returns three lists:
    #
    # metadata: [game_id, status, innings_played, exclude_from_standings,
    #            home_score, away_score, headline, summary]
    #   - home_score/away_score are the final run totals (VS1/HS1 inputs),
    #     present even when no per-inning or player data was entered
    #   - status is the game status select value (0=TBP, 1=completed, etc.)
    #   - exclude_from_standings is True/False
    #   - headline and summary may be empty strings if not entered
    #
    # innings: [game_id, inning, home_runs, away_runs]
    #   - one row per inning up to the number of innings played
    #   - empty list if no per-inning data was entered
    #
    # batting: [game_id, player_id, team_type, at_bat, run, single, double,
    #           triple, home_run, runs_batted_in, walk, strikeout,
    #           hit_by_pitch, stolen_base, sacrifice, roe]
    #   - team_type is "home" (H prefix) or "away" (V prefix)
    #   - players listed on the roster but with no AB are skipped
    #   - roe (reached on error) is included but not yet in the DB schema
    #   - empty list if no player data was entered
    #
    # referrer_division_id: navigates via the results list for that division
    # first to set a proper HTTP referrer and keep ASP session context intact.
    # Returns (None, None, None) on ADODB error for the caller to handle.

    if referrer_division_id:
        referrer_url = f"{BASE_URL}/lpadmin_resultslist.asp?url=hobo&divisionid={referrer_division_id}"
        page.goto(referrer_url)
        page.wait_for_load_state("networkidle")

    url = f"{BASE_URL}/lpadmin_resultsedit_baseball.asp?url=hobo&gameid={game_id}"
    page.goto(url)
    page.wait_for_load_state("networkidle")

    content = page.content()

    if "ADODB" in content or "BOF or EOF" in content:
        return None, None, None

    # Wait for the score inputs which are always present on a valid game page,
    # even when no player or inning data has been entered.
    try:
        page.wait_for_selector("input[name='VS1']", state="attached", timeout=15000)
    except Exception:
        print(f"  game {game_id}: page loaded but no score inputs found, skipping")
        return [], [], []

    soup = BeautifulSoup(page.content(), "html.parser")

    def get_val(name):
        el = page.query_selector(f"input[name='{name}']")
        return el.get_attribute("value").strip() if el else ""

    # final scores — always present, even with no per-inning or player data
    away_score = get_val("VS1")  # visiting team runs
    home_score = get_val("HS1")  # home team runs

    # metadata
    status_el = soup.find("select", {"name": "status"})
    status = status_el.find("option", selected=True)["value"] if status_el else ""

    innings_el = page.query_selector("select[name='PeriodsPlayed'] option[selected]")
    max_innings = int(innings_el.inner_text().strip()) if innings_el else 9

    exclude_el = soup.find("input", {"name": "NoStandings"})
    exclude = exclude_el.get("checked") is not None if exclude_el else False

    headline_el = soup.find("input", {"name": "headline"})
    headline = headline_el["value"].strip() if headline_el else ""

    summary_el = soup.find("textarea", {"name": "Gamesummary"})
    summary = summary_el.get_text(strip=True) if summary_el else ""

    metadata = [
        [
            game_id,
            status,
            max_innings,
            exclude,
            home_score,
            away_score,
            headline,
            summary,
        ]
    ]

    # innings — only populated if per-inning data was entered
    innings = []
    has_inning_data = any(
        get_val(f"HPeriod{i}") or get_val(f"VPeriod{i}")
        for i in range(1, max_innings + 1)
    )
    if has_inning_data:
        for i in range(1, max_innings + 1):
            home_runs = get_val(f"HPeriod{i}")
            away_runs = get_val(f"VPeriod{i}")
            innings.append([game_id, i, home_runs or "0", away_runs or "0"])

    # batting — V prefix = away, H prefix = home
    # Only attempted if at least one player input exists on the page
    batting = []
    if page.query_selector("input[name='VPlayerID_1']"):
        for prefix, team_type in [("V", "away"), ("H", "home")]:
            n = 1
            while True:
                player_id = get_val(f"{prefix}PlayerID_{n}")
                if not player_id:
                    break

                ab_val = get_val(f"{prefix}Stat015_{n}")
                if ab_val:
                    batting.append(
                        [
                            game_id,
                            player_id,
                            team_type,
                            ab_val,  # at_bat
                            get_val(f"{prefix}Stat016_{n}"),  # run
                            get_val(f"{prefix}Stat017_{n}"),  # single
                            get_val(f"{prefix}Stat018_{n}"),  # double (second_base)
                            get_val(f"{prefix}Stat019_{n}"),  # triple
                            get_val(f"{prefix}Stat020_{n}"),  # home_run
                            get_val(f"{prefix}Stat021_{n}"),  # runs_batted_in
                            get_val(f"{prefix}Stat022_{n}"),  # walk
                            get_val(f"{prefix}Stat023_{n}"),  # strikeout
                            get_val(f"{prefix}Stat024_{n}"),  # hit_by_pitch
                            get_val(f"{prefix}Stat026_{n}"),  # stolen_base
                            get_val(f"{prefix}Stat029_{n}"),  # sacrifice
                            get_val(f"{prefix}Stat031_{n}"),  # roe
                        ]
                    )

                n += 1

    return metadata, innings, batting


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.set_default_timeout(60000)

        login(page)
        print("Login done, starting scrape\n")

        # -- News --
        print("Scraping news list...")
        news = scrape_news(page)
        write_csv("news.csv", news)

        print("Scraping news content...")
        article_rows = [["ArticleID", "Title", "Content", "LastUpdated"]]
        for row in news[1:]:
            article_id = row[1]
            print(f"  article {article_id}...")
            article_rows.append(scrape_news_content(page, article_id))
        write_csv("news_content.csv", article_rows)

        # -- Divisions --
        print("Scraping divisions...")
        divisions = scrape_divisions(page)
        write_csv("divisions.csv", divisions)
        print(f"  {len(divisions) - 1} divisions found\n")

        # -- Teams --
        print("Scraping teams...")
        divisions = scrape_divisions(page)
        teams = scrape_teams(page, divisions)
        write_csv("teams.csv", teams)
        print(f"  {len(teams) - 1} teams found\n")

        # -- Players --
        print("Scraping players...")
        players = scrape_players(page)
        write_csv("players.csv", players)
        print(f"  {len(players) - 1} players found\n")

        # -- Game IDs --
        print("Scraping game IDs...")
        divisions = scrape_divisions(page)
        game_ids = scrape_game_ids(page, divisions)
        write_csv("game_ids.csv", game_ids)
        print(f"  {len(game_ids) - 1} total games found\n")

        # -- Game Stats --
        # Writes incrementally to CSV and checkpoints after each game so a
        # crash or network timeout can be resumed without losing progress.
        # Delete checkpoint.txt to start fresh.

        print("Scraping game stats...")

        INNINGS_HEADER = ["game_id", "inning", "home_runs", "away_runs"]
        BATTING_HEADER = [
            "game_id",
            "player_id",
            "team_type",
            "at_bat",
            "run",
            "single",
            "double",
            "triple",
            "home_run",
            "runs_batted_in",
            "walk",
            "strikeout",
            "hit_by_pitch",
            "stolen_base",
            "sacrifice",
            "roe",
        ]
        METADATA_HEADER = [
            "game_id",
            "status",
            "innings_played",
            "exclude_from_standings",
            "home_score",
            "away_score",
            "headline",
            "summary",
        ]

        divisions = scrape_divisions(page)
        game_ids = scrape_game_ids(page, divisions)
        game_division_map = {row[0]: row[6] for row in game_ids[1:]}
        games_to_scrape = [row[0] for row in game_ids[1:]]
        total = len(games_to_scrape)

        # Resume from checkpoint if one exists, otherwise write fresh headers
        start_index = read_checkpoint() + 1
        if start_index == 0:
            append_csv(OUT_INNINGS, [], write_header=True, header=INNINGS_HEADER)
            append_csv(OUT_BATTING, [], write_header=True, header=BATTING_HEADER)
            append_csv(OUT_METADATA, [], write_header=True, header=METADATA_HEADER)
            print("  Starting fresh scrape")
        else:
            print(f"  Resuming from game {start_index + 1}/{total} (checkpoint found)")

        for i, gid in enumerate(games_to_scrape):
            if i < start_index:
                continue

            print(f"  [{i + 1}/{total}] game {gid}")
            time.sleep(random.uniform(*REQUEST_DELAY))

            metadata, innings, batting = scrape_game_stats(
                page, gid, referrer_division_id=game_division_map.get(gid)
            )

            # None return means ADODB error — try re-login then retry once
            if metadata is None:
                print(f"  game {gid}: ADODB error, attempting session recovery...")
                if is_session_alive(page):
                    print(f"  game {gid}: session OK, record missing, skipping")
                    write_checkpoint(i)
                    continue
                relogin(page)
                metadata, innings, batting = scrape_game_stats(
                    page, gid, referrer_division_id=game_division_map.get(gid)
                )
                if metadata is None:
                    print(f"  game {gid}: still failing after re-login, skipping")
                    write_checkpoint(i)
                    continue

            append_csv(OUT_METADATA, metadata)
            append_csv(OUT_INNINGS, innings)
            append_csv(OUT_BATTING, batting)
            write_checkpoint(i)

        print(f"\nDone. Scrape complete.")

except Exception as e:
    print("OUTER Error:", e)
    raise
