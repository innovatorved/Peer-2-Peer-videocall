const PRODUCTION = process.env.PRODUCTION;

const PRINT = (msg) => {
    PRODUCTION != "TRUE" ? console.log(msg) : "";
};

export default PRINT;