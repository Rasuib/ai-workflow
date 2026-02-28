import { Router } from "express"
import Engine from "../engine/engine.js";
import blocks from "../engine/blockRegistry.js";
const router = Router();

const engine = new Engine(blocks);
router.post('/execute',async(req,res,next)=>{
    const workflow = req.body;

    
    try{
        const outputs = await engine.run(workflow);
        res.json({outputs});
    }catch(err){
        if (err.execution) {
    err.status = 500;
    } else {
        err.status = 400;
    }

        next(err);
    }
});
export default router;