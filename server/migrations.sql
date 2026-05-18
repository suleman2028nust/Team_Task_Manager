-- ====================================================================
-- DATABASE MIGRATIONS & SCHEMA OPTIMIZATIONS
-- Adds SQL Functions, Triggers, and Stored Procedures to simplify code,
-- reduce backend roundtrips, and guarantee data integrity.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. FUNCTION: get_dashboard_overview
-- Optimizes GET /api/dashboard by fetching stats and recent tasks
-- in a single high-performance SQL query returning JSON.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_dashboard_overview(p_user_id INT)
RETURNS JSON AS $$
DECLARE
    v_stats JSON;
    v_recent_tasks JSON;
BEGIN
    -- 1. Calculate task aggregate statistics & joined teams count
    SELECT json_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'teams', (SELECT COUNT(*) FROM team_members WHERE user_id = p_user_id)
    ) INTO v_stats
    FROM tasks
    WHERE created_by = p_user_id OR assigned_to = p_user_id;

    -- If there are no tasks for the user, COUNT(*) returns 0, but we want a guaranteed default structure
    IF v_stats IS NULL OR (v_stats->>'total')::int = 0 THEN
        v_stats := json_build_object(
            'total', 0,
            'pending', 0,
            'in_progress', 0,
            'completed', 0,
            'teams', (SELECT COUNT(*) FROM team_members WHERE user_id = p_user_id)
        );
    END IF;

    -- 2. Fetch the 5 most recent tasks assigned to or created by this user
    SELECT COALESCE(json_agg(t_row), '[]'::json) INTO v_recent_tasks
    FROM (
        SELECT
            t.id,
            t.title,
            t.status,
            t.priority,
            t.due_date,
            tm.name       AS team_name,
            u.username    AS assignee_name
        FROM tasks t
        LEFT JOIN teams tm ON t.team_id    = tm.id
        LEFT JOIN users u  ON t.assigned_to = u.id
        WHERE t.created_by = p_user_id OR t.assigned_to = p_user_id
        ORDER BY t.created_at DESC
        LIMIT 5
    ) t_row;

    -- Return consolidated JSON payload matching Dashboard requirements
    RETURN json_build_object(
        'stats', v_stats,
        'recent_tasks', v_recent_tasks
    );
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 2. TRIGGER FUNCTION: auto_add_team_creator
-- Automatically adds the team creator as a member of the team
-- on team insert. Simplifies the backend insert flow.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_add_team_creator()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO team_members (team_id, user_id)
    VALUES (NEW.id, NEW.created_by)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind trigger to `teams` table
DROP TRIGGER IF EXISTS after_team_insert ON teams;
CREATE TRIGGER after_team_insert
AFTER INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION auto_add_team_creator();

-- --------------------------------------------------------------------
-- 3. TRIGGER FUNCTION: verify_task_assignee
-- Guarantees task assignment integrity by validating that an assignee
-- is actually a registered member of the task's team.
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_task_assignee()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assigned_to IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_id = NEW.team_id AND user_id = NEW.assigned_to
        ) THEN
            RAISE EXCEPTION 'Integrity Error: User ID % is not a member of Team ID %', NEW.assigned_to, NEW.team_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind trigger to `tasks` table
DROP TRIGGER IF EXISTS check_task_assignee ON tasks;
CREATE TRIGGER check_task_assignee
BEFORE INSERT OR UPDATE OF assigned_to, team_id ON tasks
FOR EACH ROW
EXECUTE FUNCTION verify_task_assignee();
