import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // use https
});

// File එකක buffer එකක් ලබා දී, එය Cloudinary වෙත upload කර, URL එක return කරන function එක
export const uploadToCloudinary = async (fileBuffer, folderName = 'smart_farm_products') => {
  return new Promise((resolve, reject) => {
    // buffer එක stream එකක් බවට පත් කර, Cloudinary upload_stream එකට pipe කරන්න
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folderName,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          reject(error);
        } else {
          // සාර්ථකව upload වූ පසු, secure URL එක resolve කරන්න
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;

