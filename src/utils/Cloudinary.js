import {v2 as cloudinary} from 'cloudinary'; // storage of video or photos in cloudinary
import fs from 'fs'; // local storage data store data access

  cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });


    const uploadoncloudinary = async (localfilepath) => {
      try {
        if(!localfilepath) return null;
        // upload a video or image in cloudinary
        const responces = await cloudinary.uploader.upload(localfilepath,{resource_type:"auto"})
        // print a cloudinary data are successfully store or not
        // console.log("file was uploaded on cloudinary : ",responces.url);
        fs.unlinkSync(localfilepath);
        return responces
      } catch (error) {
        fs.unlinkSync(localfilepath) // remove the locally saved temporary file as the uploadoperation got failed
        return null
      }
    }

    // cloudinary.v2.uploader.upload("url",{public_id : "olymic_flag"},function(error,result){console.log(result);});

    export {uploadoncloudinary}