-- 6 dummy players per team, active roster period from a fixed point through open-ended
-- (daterange with no upper bound so they show up on any game date going forward)

DO $$
DECLARE
    v_player_id INTEGER;
    v_team_id INTEGER;
    v_names TEXT[][] := ARRAY[
        ARRAY['Dummy','Anderson'], ARRAY['Dummy','Brooks'], ARRAY['Dummy','Carter'],
        ARRAY['Dummy','Dawson'], ARRAY['Dummy','Ellis'], ARRAY['Dummy','Foster']
    ];
    v_name TEXT[];
BEGIN
    FOREACH v_team_id IN ARRAY ARRAY[20, 21]
    LOOP
        FOREACH v_name SLICE 1 IN ARRAY v_names
        LOOP
            INSERT INTO "Players" (first_name, last_name, current_team)
            VALUES (v_name[1], v_name[2] || '_T' || v_team_id, v_team_id)
            RETURNING id INTO v_player_id;

            INSERT INTO "Rosters" (team_id, player_id, active_period)
            VALUES (v_team_id, v_player_id, daterange('2024-01-01', NULL));
        END LOOP;
    END LOOP;
END $$;
