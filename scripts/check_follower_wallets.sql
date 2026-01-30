-- Check if follower wallets exist in the database

-- Show all follower wallets
SELECT 
    fw.id,
    fw.user_id,
    fw.chain,
    fw.address,
    u.username,
    u.display_name
FROM follower_wallets fw
LEFT JOIN users u ON fw.user_id = u.id
ORDER BY fw.id;

-- Count total follower wallets
SELECT COUNT(*) as total_follower_wallets FROM follower_wallets;

-- Show users
SELECT id, username, display_name FROM users;

