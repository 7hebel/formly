SQLite format 3   @                                                                     .v�� n ���nr                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        �##�ItableinvitationsinvitationsCREATE TABLE invitations (
        user_uuid STRING NOT NULL,
        group_id STRING NOT NULL,
        PRIMARY KEY (user_uuid, group_id),
        FOREIGN KEY (user_uuid) REFERENCES users(user_uuid) ON DELETE CASCADE
    )5I# indexsqlite_autoindex_invitations_1invitations�v�KtableusersusersCREATE TABLE users (
        uuid STRING PRIMARY KEY,
        fullname STRING NOT NULL,
        email STRING NOT NULL UNIQUE,
        password STRING NOT NULL,
        groups STRING NOT NULL,
        trusted_ip STRING
    ))= indexsqlite_autoindex_users_2users)= indexsqlite_autoindex_users_1users          � �D                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  �9M�O]1e717345b7c1458ca8cfc93312321776Account Aa@a$2b$12$goC7PG5t8owISFOM14K1nuqbyN�[	M��]1e717345b7c1458ca8cfc9�9M�O]1e717345b7c1458ca8cfc93312321776Account Aa@a$2b$12$goC7PG5t8owISFOM14K1nuqbyNvYMDqSCsQiesJCtAll8mLD5o8sO|cde962c7459b486faeb8f901e1264285da39a3ee5e6b4b0d3255bfef95601890afd80709�9M�O]aa77c78594d54b2da220d106d14a8630Account Bb@b$2b$12$guMI.QahxkEO4uS.6Uh2M.ihOWfgYMss59AC5RNOmNkYPHTRs9L82|cde962c7459b486faeb8f901e12642854b84b15bff6ee5796152495a230e45e3d7e947d9
   � ��                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           $Maa77c78594d54b2da220d106d14a8630#M	1e717345b7c1458ca8cfc93312321776
   � ��                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     b@b	a@a      �                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 CMMaa77c78594d54b2da220d106d14a8630cde962c7459b486faeb8f901e1264285
      �                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 DMM	aa77c78594d54b2da220d106d14a8630cde962c7459b486faeb8f901e1264285