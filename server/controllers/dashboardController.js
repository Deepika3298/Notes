const Note= require('../Models/Notes');
const mongoose= require('mongoose');

//Get dashboard
exports.dashboard= async (req,res)=>{
    let perPage= 12;
    let page= req.query.page || 1;
    const locals={
        title:'Dashboard',
        description:'Free Notes App'
    }

    try{
         const notes= await Note.aggregate([
            {
                $sort:{
                    updatedAt:-1,
                }
            },
            {
                $match:{ user: new mongoose.Types.ObjectId(req.user.id)},
            },
            {
                $project:{
                    title:{$substr:['$title',0,30]},
                    body:{$substr:['$body',0,100]}
                }
            }
         ])
         .skip(perPage * page - perPage)
         .limit(perPage)
         .exec();

         const count= await Note.count();


                
        res.render('dashboard/index',{
            userName:req.user.firstName,
            locals,
            notes,
            layout:'../views/layouts/dashboard',
            current: page,
            pages: Math.ceil(count/perPage)
        });
            
    }catch(error){
        console.log(error);
    }   
}

//GET View Specific Note
exports.dashboardViewNote= async (req,res)=>{
 const note= await Note.findById({_id: req.params.id})
 .where({user: req.user.id}).lean()

 if(note){
    res.render('dashboard/view-note',
    {
       noteID: req.params.id,
       note,
       layout:'../views/layouts/dashboard' 
    })
 } else{
    res.send('Something went wrong')
 }
}

//PUT- Update specific note
exports.dashboardUpdateNote = async (req,res)=>{
    try {
        await Note.findOneAndUpdate(
            {_id: req.params.id},
            {title: req.body.title, body: req.body.body, updatedAt: Date.now()}
        ).where({user: req.user.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)  
    }
}

//Delete- To delete note
exports.dashboardDeleteNote= async (req,res)=>{
    try {
        await Note.deleteOne({_id:req.params.id}).where({user: req.user.id})
        res.redirect('/dashboard');
    } catch (error) {
       console.log(error);
    }
}

//Get- To add notes
exports.dashboardAddNote= async (req,res)=>{
    res.render('dashboard/add',{
        layout: ('../views/layouts/dashboard')
    });
}

//Post-To add notes
exports.dashboardAddNoteSubmit= async (req,res)=>{
    try {
       req.body.user= req.user.id;
       await Note.create(req.body);
       res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
    }
}

//Get-Search Note
exports.dashboardSearch= async (req,res)=>{
    try {
        res.render('/dashboard/search',{
            searchResults: '',
            layout:'../views/layouts/dashboard'
        })
    } catch (error) {
        console.log(error)
    }
}

//Post- Search Note
exports.dashboardSearchSubmit= async (req,res)=>{
    try {
         let searchTerm= req.body.searchTerm;
         const SearchNoSpecialChars= searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
         const searchResults= await Note.find({
            $or: [
                { title: { $regex: new RegExp( SearchNoSpecialChars , 'i') } },
                { body: { $regex: new RegExp( SearchNoSpecialChars , 'i') } }
            ]
        }).where({user: req.user.id});
        res.render('dashboard/search',{
            searchResults,
            layout:'../views/layouts/dashboard'
        })
    } catch (error) {
        console.log(error)
    }
}