const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Regex to match the button gradients
const regexes = [
  // Landing page / buttons
  {
    find: /from-violet-600 to-cyan-600/g,
    replace: "from-[#eae151] to-[#ffd60a] text-black"
  },
  {
    find: /from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600/g,
    replace: "from-[#eae151] to-[#ffd60a] hover:from-[#dcd341] hover:to-[#ebc309] text-black"
  },
  {
    find: /from-indigo-500 to-purple-500/g,
    replace: "from-[#eae151] to-[#ffd60a] text-black"
  },
  {
    find: /from-indigo-600 to-purple-600/g,
    replace: "from-[#eae151] to-[#ffd60a] text-black"
  },
  {
    find: /from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600/g,
    replace: "from-[#eae151] to-[#ffd60a] hover:from-[#dcd341] hover:to-[#ebc309] text-black"
  },
  // Ensure we don't end up with `text-white text-black`
  {
    find: /text-white(.*)text-black/g,
    replace: "text-black$1"
  },
  {
    find: /text-black(.*)text-white/g,
    replace: "text-black$1"
  }
];

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Additional manual replacements for specific known buttons:
    content = content.replace(/bg-gradient-to-r from-violet-600 to-cyan-600 text-white/g, "bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black font-bold");
    content = content.replace(/bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white/g, "bg-gradient-to-r from-[#eae151] to-[#ffd60a] hover:from-[#dcd341] hover:to-[#ebc309] text-black font-bold");
    content = content.replace(/bg-white text-black/g, "bg-gradient-to-r from-[#eae151] to-[#ffd60a] text-black font-bold");
    content = content.replace(/bg-white hover:bg-zinc-100 text-black/g, "bg-gradient-to-r from-[#eae151] to-[#ffd60a] hover:opacity-90 text-black font-bold");
    content = content.replace(/bg-zinc-100 hover:bg-zinc-200 text-black/g, "bg-gradient-to-r from-[#eae151] to-[#ffd60a] hover:opacity-90 text-black font-bold");
    content = content.replace(/bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white/g, "bg-gradient-to-r from-[#eae151] to-[#ffd60a] hover:opacity-90 text-black font-bold");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
