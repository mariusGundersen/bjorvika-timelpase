const getGrayscale = (data, index) => (data[index*4+0] + data[index*4+1] + data[index*4+2])/3;

export default getGrayscale;