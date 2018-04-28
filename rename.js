const fs = require('fs');

fs.readdir('public/img', (err, files) => {
  const regex = /PANO_(\d{4})(\d{2})(\d{2})_(\d+).jpg/;
  for(const file of files){
    const match = regex.exec(file);
    if(match){
      console.log(file, match[1], match[2], match[3]);
      fs.rename(`public/img/${file}`, `public/img/munch-${match[1]}-${match[2]}-${match[3]}.jpg`);
    }
  }
})