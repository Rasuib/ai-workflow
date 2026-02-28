import express from 'express';
import workflowRouter from './src/routes/workflow.js';

const app = express();




app.use(express.json());

app.use('/workflow', workflowRouter);
app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    if (err.execution) {
        return res.status(errorStatus).json({
            error: err.message,
            execution: err.execution,
        });
    }else{
        return res.status(errorStatus).json({ error: err.message });
    }
})
export default app;

