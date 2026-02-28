const BLOCKS = {
    trigger : {
        type : 'trigger',
        execute : async(input,config) => {
            return { text: "This product is bad" };
        } 
    },
    sentiment : {
        type : 'sentiment',
        execute : async(input,config) => {
            const negative = input.text.includes("bad");
            return { sentiment: negative ? "NEGATIVE" : "POSITIVE" };
        } 
    },
    email : {
        type : 'email',
        execute : async(input,config) => {
            return { emailSentFor: input.sentiment };
        } 
    }
}
export default BLOCKS;
