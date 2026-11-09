using Cendekia.Domain.Auth;
using Cendekia.Domain.School;
using Microsoft.EntityFrameworkCore;

namespace Cendekia.Persistence.Context;

public class CendekiaDbContext : DbContext
{
    public CendekiaDbContext(DbContextOptions<CendekiaDbContext> options) : base(options)
    {
    }

    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<SchoolContent> SchoolContents => Set<SchoolContent>();
    public DbSet<WebsiteSettings> WebsiteSettings => Set<WebsiteSettings>();
    public DbSet<SchoolIdentity> SchoolIdentity => Set<SchoolIdentity>();
    public DbSet<HomepageImages> HomepageImages => Set<HomepageImages>();
    public DbSet<SpmbInformation> SpmbInformation => Set<SpmbInformation>();
    public DbSet<SpmbSettings> SpmbSettings => Set<SpmbSettings>();
    public DbSet<SpmbWave> SpmbWaves => Set<SpmbWave>();
    public DbSet<SpmbApplication> SpmbApplications => Set<SpmbApplication>();
    public DbSet<LmpSettings> LmpSettings => Set<LmpSettings>();
    public DbSet<LmpApplication> LmpApplications => Set<LmpApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<AuthSession>(e => {
            e.ToTable("auth_sessions"); e.HasKey(x => x.Id);
            e.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.ExpiresAt);
        });
        modelBuilder.Entity<AcademicYear>(e => { e.ToTable("academic_years"); e.HasKey(x => x.Code); });
        modelBuilder.Entity<SpmbWavePeriod>(e => {
            e.ToTable("spmb_wave_periods"); e.HasKey(x => new { x.AcademicYear, x.WaveNumber, x.Revision });
            e.HasIndex(x => new { x.AcademicYear, x.WaveNumber, x.StartDate, x.EndDate }).IsUnique();
            e.HasOne<AcademicYear>().WithMany().HasForeignKey(x => x.AcademicYear).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<SpmbWave>().WithMany().HasForeignKey(x => x.WaveNumber).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<LmpEvent>(e => { e.ToTable("lmp_events"); e.HasKey(x => x.Id); e.Property(x => x.Title).UseCollation("utf8mb4_bin"); });
        modelBuilder.Entity<SchoolContentCollection>(e => { e.ToTable("school_content_collections"); e.HasKey(x => x.Code); });
        modelBuilder.Entity<SchoolMissionRecord>(e => { e.ToTable("school_missions"); e.HasKey(x => x.Id); e.HasIndex(x => new { x.IdentityId, x.Position }).IsUnique(); });
        modelBuilder.Entity<SpmbInformationStepRecord>(e => { e.ToTable("spmb_information_steps"); e.HasKey(x => x.Id); e.HasIndex(x => new { x.InformationId, x.Position }).IsUnique(); });
        modelBuilder.Entity<SpmbDocumentRequirement>(e => { e.ToTable("spmb_document_requirements"); e.HasKey(x => x.Id); e.HasIndex(x => new { x.InformationId, x.ApplicantType, x.Position }).IsUnique(); });
        modelBuilder.Entity<LmpSubject>(e => { e.ToTable("lmp_subjects"); e.HasKey(x => x.Id); e.HasIndex(x => x.Code).IsUnique(); e.HasIndex(x => x.Name).IsUnique(); });
        modelBuilder.Entity<SpmbPaymentProof>(e => {
            e.ToTable("spmb_payment_proofs"); e.HasKey(x => x.ApplicationId);
            e.Property(x => x.Content).HasColumnType("mediumblob");
            e.HasOne<SpmbApplication>().WithOne(x => x.PaymentProof).HasForeignKey<SpmbPaymentProof>(x => x.ApplicationId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<LmpPaymentProof>(e => {
            e.ToTable("lmp_payment_proofs"); e.HasKey(x => x.ApplicationId);
            e.Property(x => x.Content).HasColumnType("mediumblob");
            e.HasOne<LmpApplication>().WithOne(x => x.PaymentProof).HasForeignKey<LmpPaymentProof>(x => x.ApplicationId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<SpmbApplicantProfile>(e => {
            e.ToTable("spmb_applicant_profiles"); e.HasKey(x => x.ApplicationId);
            e.Property(x => x.HeightCm).HasPrecision(5, 1); e.Property(x => x.WeightKg).HasPrecision(5, 1);
            e.HasOne<SpmbApplication>().WithOne(x => x.Profile).HasForeignKey<SpmbApplicantProfile>(x => x.ApplicationId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<SpmbDocument>(e => {
            e.ToTable("spmb_application_documents"); e.HasKey(x => x.ApplicationId);
            e.Property(x => x.Content).HasColumnType("mediumblob");
            e.Property(x => x.Compression).HasMaxLength(10);
            e.HasOne<SpmbApplication>().WithOne(x => x.Document).HasForeignKey<SpmbDocument>(x => x.ApplicationId).OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<LmpDocument>(e => { e.ToTable("lmp_application_documents"); e.HasKey(x => x.ApplicationId); e.Property(x => x.Content).HasColumnType("mediumblob"); });

        modelBuilder.Entity<LmpInformationStepRecord>(entity => {
            entity.ToTable("lmp_information_steps"); entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.SettingsId, x.Position }).IsUnique();
        });
        modelBuilder.Entity<LmpSettings>(entity => {
            entity.HasMany(x => x.StepRecords).WithOne().HasForeignKey(x => x.SettingsId).OnDelete(DeleteBehavior.Cascade);
            entity.Navigation(x => x.StepRecords).AutoInclude();
            entity.ToTable("lmp_settings"); entity.HasKey(x => x.Id);
            entity.OwnsOne(x => x.Config, owned => {
                owned.Ignore(x => x.Steps);
                foreach (var property in typeof(LmpConfig).GetProperties().Where(p => p.Name != nameof(LmpConfig.Steps))) owned.Property(property.Name).HasColumnName(property.Name);
            });
            entity.Navigation(x => x.Config).IsRequired();
            entity.Property(x => x.Version).IsConcurrencyToken();
        });
        modelBuilder.Entity<LmpApplication>(entity => {
            entity.ToTable("lmp_applications"); entity.HasKey(x => x.Id);
            entity.HasOne(x => x.Event).WithMany().HasForeignKey(x => x.EventId).OnDelete(DeleteBehavior.Restrict);
            entity.Navigation(x => x.Event).AutoInclude();
            entity.HasIndex(x => x.SubmissionKey).IsUnique();
            entity.HasOne(x => x.Subject).WithMany().HasForeignKey(x => x.SubjectId).OnDelete(DeleteBehavior.Restrict);
            entity.Navigation(x => x.Subject).AutoInclude();
            entity.HasOne(x => x.Attachment).WithOne().HasForeignKey<LmpDocument>(x => x.ApplicationId).OnDelete(DeleteBehavior.Cascade);
            entity.Property(x => x.Version).IsConcurrencyToken();
            entity.Property(x => x.SubmittedAt).HasConversion(v => v, v => DateTime.SpecifyKind(v, DateTimeKind.Utc));
        });

        modelBuilder.Entity<SpmbInformation>(entity =>
        {
            entity.ToTable("spmb_information");
            entity.HasKey(x => x.Id);
            entity.OwnsOne(x => x.Config, owned => {
                owned.Ignore(x => x.Steps); owned.Ignore(x => x.NewStudentDocuments); owned.Ignore(x => x.TransferDocuments);
                foreach (var property in typeof(SpmbInformationConfig).GetProperties().Where(p => p.PropertyType != typeof(List<string>) && p.PropertyType != typeof(List<SpmbInformationStep>)))
                    owned.Property(property.Name).HasColumnName(property.Name);
            });
            entity.Navigation(x => x.Config).IsRequired();
            entity.HasMany(x => x.StepRecords).WithOne().HasForeignKey(x => x.InformationId).OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(x => x.DocumentRecords).WithOne().HasForeignKey(x => x.InformationId).OnDelete(DeleteBehavior.Cascade);
            entity.Navigation(x => x.StepRecords).AutoInclude(); entity.Navigation(x => x.DocumentRecords).AutoInclude();
            entity.Property(x => x.Version).IsConcurrencyToken();
        });

        modelBuilder.Entity<HomepageImages>(entity =>
        {
            entity.ToTable("homepage_images");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Version).IsConcurrencyToken();
        });

        modelBuilder.Entity<SchoolIdentity>(entity =>
        {
            entity.ToTable("school_identity");
            entity.HasKey(x => x.Id);
            entity.HasMany(x => x.MissionRecords).WithOne().HasForeignKey(x => x.IdentityId).OnDelete(DeleteBehavior.Cascade);
            entity.Navigation(x => x.MissionRecords).AutoInclude();
            entity.Property(x => x.Version).IsConcurrencyToken();
        });

        modelBuilder.Entity<WebsiteSettings>(entity =>
        {
            entity.ToTable("website_settings");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Version).IsConcurrencyToken();
        });

        modelBuilder.Entity<SpmbSettings>(entity =>
        {
            entity.ToTable("spmb_settings");
            entity.HasKey(x => x.Id);
            entity.HasOne<AcademicYear>().WithMany().HasForeignKey(x => x.AcademicYear).OnDelete(DeleteBehavior.Restrict);
            entity.Property(x => x.Version).IsConcurrencyToken();
        });
        modelBuilder.Entity<SpmbWave>(entity =>
        {
            entity.ToTable("spmb_waves");
            entity.HasKey(x => x.Number);
            entity.Property(x => x.Number).ValueGeneratedNever();
        });
        modelBuilder.Entity<SpmbWaveGroup>(entity =>
        {
            entity.ToTable("spmb_wave_groups");
            entity.HasKey(x => new { x.AcademicYear, x.WaveNumber });
            entity.HasOne<AcademicYear>().WithMany().HasForeignKey(x => x.AcademicYear).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<SpmbWave>().WithMany().HasForeignKey(x => x.WaveNumber).OnDelete(DeleteBehavior.Restrict);
        });
        modelBuilder.Entity<SpmbApplication>(entity =>
        {
            entity.ToTable("spmb_applications");
            entity.HasKey(x => x.Id);
            entity.HasOne(x => x.Period).WithMany().HasForeignKey(x => new { x.AcademicYear, x.WaveNumber, x.WaveRevision })
                .HasPrincipalKey(x => new { x.AcademicYear, x.WaveNumber, x.Revision }).OnDelete(DeleteBehavior.Restrict);
            entity.Navigation(x => x.Period).AutoInclude();
            entity.HasIndex(x => x.SubmissionKey).IsUnique();
            entity.HasIndex(x => new { x.AcademicYear, x.Nisn }).IsUnique();
            entity.HasIndex(x => new { x.AcademicYear, x.WaveNumber });
            entity.Property(x => x.Version).IsConcurrencyToken();
            entity.Property(x => x.SubmittedAt).HasConversion(value => value, value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
            entity.Property(x => x.UpdatedAt).HasConversion(value => value, value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
        });

        modelBuilder.Entity<SchoolContentImage>(entity => {
            entity.ToTable("school_content_images"); entity.HasKey(x => x.Id);
            entity.Property(x => x.Content).HasColumnType("mediumblob");
        });
        modelBuilder.Entity<SchoolContent>(entity =>
        {
            entity.ToTable("school_content");
            entity.HasOne(x => x.Image).WithOne().HasForeignKey<SchoolContent>(x => x.ImageId).OnDelete(DeleteBehavior.Restrict);
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.Collection, x.Slug }).IsUnique();
            entity.HasOne<SchoolContentCollection>().WithMany().HasForeignKey(x => x.Collection).OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(x => new { x.Collection, x.Status });
            entity.Property(x => x.Body).HasColumnType("longtext");
            entity.Property(x => x.Version).IsConcurrencyToken();
            entity.Property(x => x.CreatedAt).HasConversion(value => value, value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
            entity.Property(x => x.UpdatedAt).HasConversion(value => value, value => DateTime.SpecifyKind(value, DateTimeKind.Utc));
            entity.Property(x => x.PublishedAt).HasConversion(value => value, value => value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : value);
        });

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Username).HasColumnName("username").HasMaxLength(80).IsRequired();
            entity.Property(x => x.FullName).HasColumnName("full_name").HasMaxLength(150).IsRequired();
            entity.Property(x => x.Email).HasColumnName("email").HasMaxLength(150);
            entity.Property(x => x.Phone).HasColumnName("phone").HasMaxLength(50);
            entity.Property(x => x.Role).HasColumnName("role").HasConversion<string>().HasMaxLength(30);
            entity.Property(x => x.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(30);
            entity.Property(x => x.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            entity.Property(x => x.PasswordSalt).HasColumnName("password_salt").HasMaxLength(255).IsRequired();
            entity.Property(x => x.LastLoginAt).HasColumnName("last_login_at");
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
            entity.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(x => x.Username).IsUnique();
            entity.HasIndex(x => x.Email).IsUnique();
        });
    }
}
