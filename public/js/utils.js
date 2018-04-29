
export const toBlob = canvas => new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.95));

export async function upload(blob, name){
  const fd = new FormData();
  fd.append('file', blob, name);

  await fetch('/api/upload',
  {
      method: 'post',
      body: fd
  });
}

export const toImg = (blob, img) => new Promise(res => {
  const url = URL.createObjectURL(blob);

  img.onload = function() {
    // no longer need to read the blob so it's revoked
    URL.revokeObjectURL(url);
    res();
  };

  img.src = url;
});