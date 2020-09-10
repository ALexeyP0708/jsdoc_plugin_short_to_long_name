let {Doclet}=require('jsdoc/doclet');
class FixMethods {
    static parseName(name){
        return name.match(/^([\.#~]?[^\.#~]+)/g);
    }
    static convertName(name,prefix){
        prefix=this.parseName(prefix);
        let new_prefix='';
        let lastSymbol='';
        for(let key=0; key<name.length; key++){
            let char=name[key];
            if(['.', '#', '~'].includes(char)){
                lastSymbol=char;
                new_prefix+=prefix[key]??'';
                name=name.slice(key+1);
                key--;
            }else {
                name=lastSymbol+name;
                break;
            }
        }
        if(new_prefix===''){
            name=name.replace(/^[\.~#]*/,'');
        }
        return new_prefix+name;
    }
    static expandLinkTag(str, prefix) {
        let pattern = /{@(link|linkcode|linkplain)[\s]+(?:([\s\S]+?)[\s]*\|[\s]*([\S\s]+?)[\s]*|([\S]+?)(?:[\s]+([\S\s]+?)|)[\s]*)}/g;
        str = str.replace(pattern,  (p0, p1, p2, p3, p4, p5) =>{
            let link = p2 ?? p4;
            let title = p3 ?? p5 ?? link;
            title = title.replace(/^[\.#~]/, '');
            if (prefix !== undefined) {
                link=this.convertName(link,prefix);
            } else {
                link =link.replace(/^[\.#~]*/,'');
            }
            if (link === title) {
                return `{@${p1} ${link}}`
            } else {
                return `{@${p1} ${link}|${title}}`
            }
        });
        return str;
    }
    static convertToLink(str,prefix){
        let pattern = /\[[\s]*([\w]*)[\s]*([\S]+)[\s]*\]/g;
        return str.replace(pattern,  (p0, p1,p2)=> {
            if (![undefined,null].includes(prefix) && prefix.length!==0) {
                return  `{@link ${this.convertName(p2,prefix)}|[${p1}${p1!=''?' ':''}${p2.replace(/^[\.#~]*/,'')}]}`;
            } else {
                p2=p2.replace(/^[\.#~]*/,'');
                return  `{@link ${p2}|[${p1}${p1!=''?' ':''}${p2}]}`;
            }
        });
    }
    static parseString(str, prefix) {
        let pattern = /@([\.#~]+[^<>\[\]\{\}]+)/g;
        str = str.replace(pattern,  (p0, p1)=> {
                if (![undefined,null].includes(prefix) && prefix.length!==0) {
                    return this.convertName(p1,prefix);
                } else {
                    return p1.replace(/^[\.#~]*/,'');
                }
            return p1;
        });
        str = this.expandLinkTag(str, prefix);
        str = this.convertToLink(str, prefix);
        return str;
    }
    static parseStringInObj(obj,prop,prefix){
        obj[prop]=this.parseString(obj[prop],prefix);
    }
}
exports.handlers = {
    processingComplete(e) {//parseComplete
        let doclets = e.doclets;
        let collection=[];
        for(let doclet of doclets){
            if(!(doclet instanceof Doclet)){
                continue;
            }
            if(doclet.undocumented===true){continue;}
            let prefix = doclet.memberof;
            let obj,prop;
            
            // @classdesc
            if (doclet.classdesc) {
                collection.push([doclet,'classdesc',prefix]);
            }
            // @description
            if (doclet.description) {
                collection.push([doclet,'description',prefix]);
            }
            //@property
            if(doclet.properties){
                for(let key of Object.keys(doclet.properties)){
                    collection.push([doclet.properties[key],'description',prefix]);
                }
            }
            //@returns
            if(doclet.returns){
                for(let key of Object.keys(doclet.returns)){
                    collection.push([doclet.returns[key],'description',prefix]);
                }
            }
            //@throws
            if(doclet.exceptions){
                for(let key of Object.keys(doclet.exceptions)){
                    collection.push([doclet.exceptions[key],'description',prefix]);
                }
            }
            //@see
            if(doclet.see){
                for(let key of Object.keys(doclet.see)){
                     key =Number(key);
                    collection.push([doclet.see,key,prefix]);
                }
            }
            //@augments
            if(doclet.augments){
                for(let key of Object.keys(doclet.augments)){
                     key =Number(key);
                    collection.push([doclet.augments,key,prefix]);
                }
            }
            //@copyright
            if (doclet.copyright) {
                collection.push([doclet,'copyright',prefix]);
            }
        }
        for(let el of collection){
            FixMethods.parseStringInObj(el[0],el[1], el[2]);
        }        
    }
};
