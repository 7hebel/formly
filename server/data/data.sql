SQLite format 3   @                                                                     .v�� n ���nr                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        �##�ItableinvitationsinvitationsCREATE TABLE invitations (
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
    ))= indexsqlite_autoindex_users_2users)= indexsqlite_autoindex_users_1users       D g gf                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           �|	M��S]823dc43e383b4746ac73f63d2bf48f81Account Aa@a$2b$12$6l.M4OHWEWae13UUXTU3aO1NRLpRKWza/rfBKZs.pRtWXhd4Hv7aS|7404a1a39ef84bb899e026ada37d2af0|d4fa9632592642a48fe6c010bb5e6fba|57ee910f59af4b6582bcc9da1f8734a04b84b15bff6ee5796152495a230e45e3d7e947d9�[	M��]cd3aeb150e564de1b35acc259ce76b40Account Bb@b$2b$12$OFHebWjMLjNLOLBsTzK1Q.NAiZvWQI6yK2ueErV/iry1AN5CHfJDi|d4fa9632592642a48fe6c010bb5e6fba|57ee910f59af4b6582bcc9da1f8734a04b84b15bff6ee5796152495a230e45e3d7e947d9   �M�O]823dc43e383b4746ac73f63d2bf48f81Account Aa@a$2b$12$6l.M4OHWEWae13UUXTU3aO1NRLpRKWza/rfBKZs.pRtWXhd4Hv7aS|7404a1a39ef84bb899e026ada37d2af04b84b15bff6ee5796152495a230e45e3d7e947d9
   � ��                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           $Mcd3aeb150e564de1b35acc259ce76b40#M	823dc43e383b4746ac73f63d2bf48f81
   � ��                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     b@b	a@a      vv                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          CMM823dc43e383b4746ac73f63d2bf48f8157ee910f59af4b6582bcc9da1f8734a0   EM823dc43e383b4746ac73f63d2bf48f81d4fa9632592642a48fe6c010bb5e6fba
      u�                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         EMM823dc43e383b4746ac73f63d2bf48f8157ee910f59af4b6582bcc9da1f8734a0   E	823dc43e383b4746ac73f63d2bf48f81d4fa9632592642a48fe6c010bb5e6fba