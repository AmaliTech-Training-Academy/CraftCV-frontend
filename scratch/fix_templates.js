import fs from 'fs';
import path from 'path';

const dir = 'app/components/templates/';
const files = fs.readdirSync(dir).filter(f => f.startsWith('CVTemplate') && f.endsWith('.vue'));

const brokenRegex = /<ul\s+v-if="parseDescription\(([^)]+)\)\.length\s*>\s*0"\s+class="([^"]+)"\s*>\s*<li\s+v-for="\(bullet,\s*idx\)\s*in\s*parseDescription\([^)]+\)"\s*:key="idx"\s+class="([^"]+)"\s*>\s*<span\s+class="([^"]+)"\s*:style="([^"]+)"\s*>&bull;<\/span>\s*<span>\{\{\s*bullet\s*\}\}<\/span>\s*<\/li>\s*<\/ul>/gs;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Replace min height
  const originalContent = content;
  content = content.replace(/class="w-full (h-full|min-h-full) /g, 'class="w-full min-h-[1123px] ');
  if (content !== originalContent) changed = true;

  // Replace parseDescription blocks
  const newContent = content.replace(brokenRegex, (match, expr, ulClass, liClass, spanClass, spanStyle) => {
    return `<template
              v-for="(blk, idx) in parseDescription(${expr})"
              :key="idx"
            >
              <p
                v-if="blk.type === 'p'"
                class="${ulClass}"
              >
                {{ blk.text }}
              </p>
              <ul
                v-else
                class="${ulClass}"
              >
                <li
                  v-for="(bullet, bIdx) in blk.items"
                  :key="bIdx"
                  class="${liClass}"
                >
                  <span
                    class="${spanClass}"
                    :style="${spanStyle}"
                  >&bull;</span>
                  <span>{{ bullet }}</span>
                </li>
              </ul>
            </template>`;
  });
  
  if (newContent !== content) {
    content = newContent;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}
