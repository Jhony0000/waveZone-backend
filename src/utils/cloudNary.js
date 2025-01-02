import {v2 as cloudnary} from "cloudinary";
import fs from 'fs'


cloudnary.config({ 
        cloud_name: process.env.CLOUDNARY_NAME, 
        api_key: process.env.CLOUDNARY_API_KEY, 
        api_secret: process.env. CLOUDNARY_API_SECRET
    });

const uplodOnCloudNary =  async (localFilePath) => {
    try {
        if(!localFilePath) return null
          console.log('local file path',localFilePath)
       const response = await cloudnary.uploader.upload(localFilePath , {
            resource_type: 'auto'
        })
        fs.unlinkSync(localFilePath);
        // console.log('file is uplod cloudnary',response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export {uplodOnCloudNary,cloudnary};