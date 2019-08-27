class Token {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}

export class Tokenizer {
    static parse(str) {
        let i = 0;
        let res = [];

        while(i < str.length) {
            if(str[i] === " ") {
                i++;
            } else if(str[i] === "'") {
                let substr = str.substring(i, str.indexOf("'", i + 1) + 1);
                res.push(new Token("REGULAR", substr));
                i += substr.length;
            } else if(str[i] === "(") {
                let substr = str.substring(i + 1, str.indexOf(")", i + 1));
                res.push(new Token("NESTED", substr));
                i += substr.length + 2;
            } else {
                let to = this.indexOf(str, /\s|\(/, i);
                if(to === -1) to = str.length;

                let substr = str.substring(i, to);
                res.push(new Token("REGULAR", substr));
                i += substr.length;
            }
        }

        return res;
    }

    static indexOf(str, re, i) {
        let index = str.slice(i).search(re);
        return index < 0 ? index : index + i;
    }
}