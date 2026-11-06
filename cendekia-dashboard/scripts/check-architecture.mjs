import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
const read = path => readFileSync(path, 'utf8');
const provider = read('Backend/Cendekia.WebAPI/CmsControllerFeatureProvider.cs');
const allowed = [...provider.matchAll(/"(\w+Controller)"/g)].map(x => x[1]);
for (const name of allowed) {
  const source = read(`Backend/Cendekia.WebAPI/Controllers/${name === 'SchoolPublicController' ? 'ContentController' : name}.cs`);
  assert(!/CendekiaDbContext|Cendekia\.Persistence|EntityFrameworkCore|\.Query\(|FromSql|SaveChanges|IUnitOfWork/.test(source), `${name} bypasses application services`);
}
const controllerFiles = readdirSync('Backend/Cendekia.WebAPI/Controllers').filter(f => f.endsWith('.cs'));
const actual = controllerFiles.flatMap(file => [...read(`Backend/Cendekia.WebAPI/Controllers/${file}`).matchAll(/public class (\w+Controller)\b/g)].map(x => x[1]));
assert.deepEqual(actual.sort(), allowed.sort(), 'Compiled controllers must match the school module allowlist');
const applicationProject = read('Backend/Cendekia.Application/Cendekia.Application.csproj');
assert(!/Persistence|WebAPI|EntityFrameworkCore|AspNetCore/.test(applicationProject));
for (const file of readdirSync('Backend/Cendekia.Application/Services').filter(f => f.endsWith('.cs'))) {
  assert(!/using Cendekia\.Persistence|using Microsoft\.EntityFrameworkCore|using Microsoft\.AspNetCore|DbContext|IQueryable|IFormFile/.test(read(`Backend/Cendekia.Application/Services/${file}`)), `${file} depends on infrastructure`);
}
const contracts = read('Backend/Cendekia.Application/Abstractions/Persistence.cs');
assert(!/IQueryable</.test(contracts));
const models = readdirSync('Backend/Cendekia.Domain/School').map(f => read(`Backend/Cendekia.Domain/School/${f}`)).join('\n');
assert(!/ConfigJson|MissionsJson/.test(models), 'Active aggregates must use relational records');
assert(!/ToJson\(/.test(read('Backend/Cendekia.Persistence/Context/CendekiaDbContext.cs')));
console.log('PASS: active controllers use services, Application depends only on Domain, repository contracts expose no IQueryable/EF, active aggregates contain no serialized JSON columns.');
