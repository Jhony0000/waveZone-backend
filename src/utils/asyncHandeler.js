const asynchandeler =  (fn) =>  {
    (req,res,next) => {
        Promise.resolve(fn(req,res,next)).catch((eror) => next(eror))
    }
}


export {asynchandeler};