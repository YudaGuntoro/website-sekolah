USE cendekia_cms;
CREATE TABLE IF NOT EXISTS spmb_brochure_files (
 InformationId INT NOT NULL PRIMARY KEY,
 Content MEDIUMBLOB NOT NULL,
 Compression VARCHAR(3) NOT NULL,
 OriginalLength INT NOT NULL,
 CONSTRAINT fk_spmb_brochure_information FOREIGN KEY (InformationId) REFERENCES spmb_information(Id) ON DELETE CASCADE,
 CONSTRAINT ck_spmb_brochure_compression CHECK (Compression IN ('raw','br')),
 CONSTRAINT ck_spmb_brochure_length CHECK (OriginalLength BETWEEN 1 AND 1048576)
) ENGINE=InnoDB;
