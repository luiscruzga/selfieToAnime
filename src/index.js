const axios = require('axios');
const sharp = require('sharp');
const { convertTo64 } = require('../utils/base64');

const getAnime = (image) => {
    return new Promise((resolve, reject) => {
        axios({
            method:'post',
            url:'https://ai.tu.qq.com/trpc.shadow_cv.ai_processor_cgi.AIProcessorCgi/Process',
            headers: { 
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "busiId": "ai_painting_anime_entry",
                "extra": "{\"face_rects\":[],\"version\":2,\"platform\":\"web\",\"data_report\":{\"parent_trace_id\":\"350df969-1f0f-a369-c206-b39338b358ht\",\"root_channel\":\"\",\"level\":0}}",
                "images": [image]
            })
        })
        .then((data) => {
            if (data.data.code !== 0) return reject(data.data);
            resolve(data.data);
        })
        .catch(err => {
            reject(err);
        });
    });
}

const resizeImage = (image) => {
    return new Promise((resolve, reject) => {
        sharp(new Buffer.from(image, 'base64'))
        .resize(720, 1080)
        .toFormat('jpeg')
        .toBuffer()
        .then(img => resolve(img.toString('base64')))
        .catch(err => reject(err));
    });
}

const cropImage = (image) => {
    return new Promise((resolve, reject) => {
        sharp(new Buffer.from(image, 'base64'))
        .extract({left: 0, top: 0, width: 830, height: 1200})
        .toBuffer()
        .then(img => resolve(img.toString('base64')))
        .catch(err => reject(err));
    });
}
/**
 * Allows you to transform an image to apply an anime / manga style
 * 
 * @param {objet} args
 * @param {string} args.photo - Image to transform, can be image path, image url or base64 image
 * @param {string} args.destinyFolder - Path to save the transformed image, if not provided the image will be delivered in base64
 * @return {Promise<string>} Transformed image
 */
 const transform = (args) => {
    return new Promise(async (resolve, reject) => {
        if (typeof args.photo === 'undefined' || args.photo === '') return reject('An image must be provided to transform...');
        
        const selfie = await convertTo64(args.photo);
        //const base64Selfie = selfie.split(';base64,').pop();
        const resizedImage = await resizeImage(selfie);
        getAnime(resizedImage)
        .then(async (data) => {
            if(data.code === 0 && data.extra !== undefined && data.extra !== ''){
                const extra = JSON.parse(data.extra);
                const image = extra.img_urls.find(el => el.includes('act-artifacts.shadowcv.qq.com'));
                const image64 = await convertTo64(image);
                const imageCrop = await cropImage(image64);
                resolve({
                    image: imageCrop,
                    url: image,
                });
            } else {
                reject('An error occurred while trying to transform the image');
            }
        })
        .catch(err => {
            console.log('error', err);
            reject('An error occurred while trying to transform the image');
        });
    });
}

module.exports = {
    transform
};