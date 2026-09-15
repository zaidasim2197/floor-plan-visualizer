const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getFiles(path.join(__dirname, 'src'));

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace whatsappLink with emailLink
  content = content.replace(/whatsappLink/g, 'emailLink');
  
  // Replace the definition in event.ts
  if (file.endsWith('event.ts')) {
    content = content.replace(
      /export const emailLink = \(number: string \| undefined, message: string\) =>\s*`https:\/\/wa\.me\/\$\{\(number \|\| ""\)\.replace\(\/\\D\/g, ""\)\}\?text=\$\{encodeURIComponent\(message\)\}`;/g,
      'export const emailLink = (email: string | undefined, subject: string) => `mailto:${email || ""}?subject=${encodeURIComponent(subject)}`;'
    );
  }

  // Replace usages of emailLink passing whatsapp[0] to pass email
  content = content.replace(/eventConfig\.contact\.whatsapp\[0\]/g, 'eventConfig.contact.email');
  
  // Replace "whatsapp" in contact map
  content = content.replace(/eventConfig\.contact\.whatsapp\.map/g, 'eventConfig.contact.whatsapp.map'); // No-op to preserve it in case it's used
  
  // Text replacements
  content = content.replace(/Phone \/ WhatsApp/gi, 'Phone Number');
  content = content.replace(/Enquire on WhatsApp/gi, 'Enquire via Email');
  content = content.replace(/Inquire on WhatsApp/gi, 'Inquire via Email');
  content = content.replace(/Instant WhatsApp Assistance/gi, 'Instant Email Assistance');
  content = content.replace(/WhatsApp Line/gi, 'Support Line');
  content = content.replace(/WhatsApp number/gi, 'Support Contact');
  content = content.replace(/via WhatsApp/gi, 'via Email');
  content = content.replace(/on WhatsApp/gi, 'via Email');
  content = content.replace(/WhatsApp/g, 'Email');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
}
