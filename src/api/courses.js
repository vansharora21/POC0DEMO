import axios from "axios";
import { ADMIN__CATEGORY } from "../constants";
const API = import.meta.env.VITE_BASE_URL_API

const getCategory =()=>{
    const getCategory = axios.get(`${API}${ADMIN__CATEGORY}`);
    console.log("here is the get category:", getCategory)
};
export default getCategory;
