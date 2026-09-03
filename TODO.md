# HOBO site

### stack

next.js
drizzle
recharts + mui for data display
nuqs -> URL params, useful for filtering/bookmarking

## Site TODO

### v1.1 fixes
- Clean up `any` types
- Add Zod validation
- testing harness
- proper documentation
- Add in the last few CRUD operations
- Google Cloud Storage

### feature updates
- Tournament view
- Draft system

### old pages

- home/welcome
  - headlines
  - recent news
  - schedule/upcoming games
- news
  - all announcements/message boards
  - photo boards
- teams/rosters
  - overall team standings
  - player stats
- schedules
  - all for the league
  - filter for a team/data range
- results
  - recent games
  - filter for teams, date range
- forums
  - registration
- info
  - hall of fame
  - league champs (playoffs winners)
  - rules
  - how to score
  - 101 for new players
  - 201 for returning players
  - ed bril award

## Outside services TODO

- email list
    - <https://resend.com/pricing>
    - free 3k a month
    - 100/day
    - 5/sec rate limit
- blob (image) storage
  - google buckets
  - standard storage is $0.000031507 / 1 gibibyte hour -> 720hrs in a month so $0.022/month/gig
      - limit the image size to ~500x500 (to be determined, something to keep it smallish)
  - 100 500x500jpg images is ~20mb so well under the 1gb limit for free
      - class A (uploads) are $0.05/1000 calls
      - class B (reads) are $0.0004/10k

## Project admin stuff
- cold starts:
    - add `output: 'standalone'` in `next.config.js`
    - bundles only needed node packages, speeds up cold start time
    - need to redirect init command but look that up later
- laggy site in general:
    - watch ram usage, you've got 512mb on the server side which hopefully is enough, can up to 1gb if needed
- site gets pulled and built from the hobo/main repo/branch. make a new branch for new features/upgrades.
