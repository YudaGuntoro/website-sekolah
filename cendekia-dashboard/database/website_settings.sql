USE cendekia_cms;
CREATE TABLE IF NOT EXISTS website_settings (
  Id INT NOT NULL PRIMARY KEY,
  WhatsappNumber VARCHAR(25) NOT NULL DEFAULT '',
  Email VARCHAR(254) NOT NULL DEFAULT '',
  Address VARCHAR(1000) NOT NULL DEFAULT '',
  InstagramUrl VARCHAR(500) NOT NULL DEFAULT '',
  TiktokUrl VARCHAR(500) NOT NULL DEFAULT '',
  FacebookUrl VARCHAR(500) NOT NULL DEFAULT '',
  Version INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;
-- Preserve existing settings on repeated setup.
INSERT IGNORE INTO website_settings
  (Id, WhatsappNumber, Email, Address, InstagramUrl, TiktokUrl, FacebookUrl)
VALUES (1, '+62 878-9639-7106', 'smpitcendekiapwk@gmail.com',
  'Jl. Veteran No. 100 B, Nagri Kaler, Purwakarta (Belakang Poll Damri)',
  'https://www.instagram.com/smpitcendekia/', 'https://www.tiktok.com/@smpitcendekiapwk',
  'https://www.facebook.com/smpitcendekia');
