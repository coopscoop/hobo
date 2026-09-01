# HOBO site

### stack

next.js
drizzle
recharts + mui for data display
nuqs -> URL params, useful for filtering/bookmarking

## Site TODO

- fix DB
    - different names for the same player year over year
    - add game status column to games tabls
    - add contact info table
    - add page content table
    - add users table -> can tie in reset code stuff here
    - add profile picture url column to players table
      - use google buckets for this (locally just make some dummy urls + images for now)
    - add a view on any games displayed for what league they are
- add pages
- add user sign up/sign in
  - jwt tokens for auth is the easiest
- admin page notes
  - blob storage management
  - new admin page
  - email list
  - all players + display their contact info here
  - access sign up forums data here
  - some excel/csv export options?
    - useful for moving data to other programs

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


### double players

check emails from dad for corrections here, got 70% of them afaik so far

- Louis Armas (Armis) - 574 612
- Cam (Cameron) Aubert - 410 646
- Brian Avery - 594 602
- Wendell (Wendyll) (Wendal) (wendall) (Wendel) (Wendyll) (Wendel) Aya-Ay (Aya Ay) - 594 602 474 600 581 682 592 638 452
- Paul Baldassi - 436 608
- Al Basket (Baskett) - 405 460
- Jim Beach (Bea) - 656 633
- Ed Bril (Brill) - 559 590
- Dana Bush - 386 554
- Dave Bush - 632 676
- Rick (Ric) Clark - 483 528
- Dave (David) Collier - 623 675
- Michael (Mike) Contestable (Contestabile) - 375, 478 701
- Jim Da Silva (da Silva) (daSilva) - 413 552 700
- Gary (Garry) David - 603 606
- Ed (Eddit) Diggle - 718 580
- Hawar Doskey (Dosky) - 448 583
- Guy Douglas - 503 686
- Carlos Duschesne (Duchesne) - 392 395
- Tom Elliot (Elliott) - 443 434
- Ted Fauteaux (Fauteux) - 373 535
- John Fuciarelli - 479 557
- Ted Gaede (Gaedes) - 551 615
- Ilia Ghotbia (Ghotbi) - 522 579
- Rob Hendricksen (Henriksen) - 490 585
- Todd Jeanueault - 450 511
- Matthew (Matt) Kawamura - 372 549
- Jeff Kline (Klyne) - 440 465
- Danny LaFlamme (Laflamme) - 484 720
- Brian Latimer (Lattimer) - 480 514
- Dave Malcolmson-Morris (Malcomson-Morris) - 626 634 692
- Tony Mastrioanni (Mastroianni) - 649 652
- Bob McDermott - 470 719
- Jason (Jayson) McGee - 598 712
- Kelly Mcgiffen (Mcgiffin) - 610 655
- Danny (Dany) McNicholl (McNicoll) - 578 541 660
- Joe Medieros - 537 713
- Mike Miller - 457 706
- Sam Misale (Misalle) - 564 489
- Steve Penner - 429 431
- Tim Petitt (Pettit) (Pettitt) - 367 622 385
- Dave Pichard (Pickard) - 622 385
- Michael (Mike) Prost - 597 614
- Bill Ridley - 488 611
- Mike Rowen - 462 473
- Harvey Sashker - 409 416
- Darryl Scanlan (Scanlon) - 513 560
- Matthew (Matt) Stajov - 399 616
- Joe Stephens (Stepehens) - 517 563
- Dave St. Martin (St.Martin) - 533 697
- Matthew (Matt) Taylor - 368 596
- Paul Thompson (Thomson) - 401 459 469
- Mark (Marc) Trudel - 404 679
- Rob (Robert) Ugenti (Uggenti) - 374 379
- Takeshi Umayahara (Umayahari) - 374 379
- Johnathan (Jonathan) (Jonathon) Vincent - 595 687
- Chris Wade - 369 530
- Drew Wannamaker - 546 387
- Rob (Robert) Whitenect (Whitnect) - 711 533 425
- Scott Willaimson - 447 685
- Dave (David) Wilson - 414 442
- Ed Zinger - 543 627






















two sites or one?
    - can compare stats across both leagues
    - or just individual
email list
    - auto emails?
    - manual but give you a list?
    - <https://resend.com/pricing>
    - free 3k a month
    - 100/day
admins
    - one account?
    - multiple?
    - multiple tiers
        - read only, can edit, etc
issues that they have with the other system
opinions on the new scorecard system
    - handle subtitutes/spare player
forum link
    - two times


one level of admin - can do all
league standings on the home page



