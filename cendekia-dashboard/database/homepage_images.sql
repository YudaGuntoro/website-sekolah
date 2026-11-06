USE cendekia_cms;
CREATE TABLE IF NOT EXISTS homepage_images (
  Id INT NOT NULL PRIMARY KEY,
  HeroUrl VARCHAR(1000) NOT NULL DEFAULT '',
  DirectionUrl VARCHAR(1000) NOT NULL DEFAULT '',
  ProgramUrl VARCHAR(1000) NOT NULL DEFAULT '',
  Version INT NOT NULL DEFAULT 1
) ENGINE=InnoDB;
-- Empty overrides intentionally preserve the original school illustrations.
INSERT IGNORE INTO homepage_images (Id) VALUES (1);
