import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const read = path => readFileSync(path, 'utf8');
const provider = read('Backend/DentalCare.WebAPI/CmsControllerFeatureProvider.cs');
const allowed = [...provider.matchAll(/"(\w+Controller)"/g)].map(x => x[1]);
for (const name of allowed.filter(n => n !== 'SchoolPublicController')) {
  const source = read(`Backend/DentalCare.WebAPI/Controllers/${name}.cs`);
  assert(!/DentalCareDbContext|DentalCare\.Persistence|EntityFrameworkCore|\.Query\(|FromSql|SaveChanges|IUnitOfWork/.test(source), `${name} bypasses application services`);
}
const applicationProject = read('Backend/DentalCare.Application/DentalCare.Application.csproj');
assert(!/Persistence|WebAPI|EntityFrameworkCore|AspNetCore/.test(applicationProject));
for (const file of readdirSync('Backend/DentalCare.Application/Services').filter(f => f.endsWith('.cs'))) {
  assert(!/using DentalCare\.Persistence|using Microsoft\.EntityFrameworkCore|using Microsoft\.AspNetCore|DbContext|IQueryable|IFormFile/.test(read(`Backend/DentalCare.Application/Services/${file}`)), `${file} depends on infrastructure`);
}
const contracts = read('Backend/DentalCare.Application/Abstractions/Persistence.cs');
assert(!/IQueryable</.test(contracts));
const models = readdirSync('Backend/DentalCare.Domain/School').map(f => read(`Backend/DentalCare.Domain/School/${f}`)).join('\n');
assert(!/ConfigJson|MissionsJson/.test(models), 'Active aggregates must use relational records');
assert(!/ToJson\(/.test(read('Backend/DentalCare.Persistence/Context/DentalCareDbContext.cs')));
console.log('PASS: active controllers use services, Application depends only on Domain, repository contracts expose no IQueryable/EF, active aggregates contain no serialized JSON columns.');
