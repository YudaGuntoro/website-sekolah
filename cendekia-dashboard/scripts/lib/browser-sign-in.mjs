// Establish a real HttpOnly/CSRF-protected browser session, never inject bearer storage.
export async function browserSignIn(pageOrContext) {
  const context = typeof pageOrContext.context === 'function' ? pageOrContext.context() : pageOrContext;
  const page = await context.newPage();
  try {
    await page.goto((process.env.CMS_DASHBOARD_URL || 'http://localhost:3002') + '/signin');
    await page.getByPlaceholder('Masukkan nama pengguna').fill('admin');
    await page.getByPlaceholder('Masukkan kata sandi').fill(process.env.CMS_ADMIN_PASSWORD || 'admin123');
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();
    await page.waitForURL(url => !url.pathname.startsWith('/signin'));
  } finally { await page.close(); }
}
