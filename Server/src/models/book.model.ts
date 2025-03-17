import mongoose, { Schema, Document } from "mongoose";


interface IBook extends Document {
    bookName : string,
    author : string,
    price : number,
    seller : string,
    image : string,

}

const BookSchema : Schema<IBook> = new Schema<IBook>({
    bookName : {
        type : String,
        required :true
    },
    author : {
        type : String,
        required :true
    },
    seller :{
        type : String,
        required :true
    },
    price : {
                type : Number,
                required : true
    },
    image : {
            type : String,
            required : true
    },


})

export const Book = mongoose.model<IBook>("Book",BookSchema)


