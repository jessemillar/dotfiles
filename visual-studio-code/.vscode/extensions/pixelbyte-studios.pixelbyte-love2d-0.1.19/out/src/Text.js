"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Text {
    static is_valid_id_char(char) {
        return ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '_' || char == '.');
    }
    //Gets the word that the cursor is currently over 
    // basically, it must be a valid identifier
    //It treats A-Z,a-z,_,. as part of the identifier
    static get_identifier_under_cursor() {
        let editor = vscode.window.activeTextEditor;
        let line_number = editor.selection.start.line;
        //Grab the whole line where the cursor is
        let line = editor.document.lineAt(line_number);
        let char = '';
        let start_char = editor.selection.start.character;
        let end_char = start_char;
        //two consecutive '.' are illegal 
        let saw_dot = false;
        //1st, find the beginning of this identifier
        while (start_char - 1 >= 0) {
            char = line.text.charAt(start_char - 1);
            if (Text.is_valid_id_char(char)) {
                if (saw_dot && char == '.')
                    break;
                else if (char == '.')
                    saw_dot = true;
                else
                    saw_dot = false;
                start_char--;
            }
            else
                break;
        }
        //ok, now find the end of this identifier
        saw_dot = false;
        while (end_char < line.range.end.character) {
            char = line.text.charAt(end_char);
            if (Text.is_valid_id_char(char)) {
                if (saw_dot && char == '.')
                    break;
                else if (char == '.')
                    saw_dot = true;
                else
                    saw_dot = false;
                end_char++;
            }
            else
                break;
        }
        // console.log("Start: " + start_char, "End: " + end_char);
        if (start_char == end_char)
            return "";
        else
            return editor.document.getText(new vscode.Range(line_number, start_char, line_number, end_char));
    }
    static get_start_word(document, position) {
        let line = document.lineAt(position.line);
        let startpos = position.character;
        let endpos = 0;
        //Find the beginning of this dotted word group
        while (startpos - 1 >= 0) {
            if (!Text.is_valid_id_char(line.text.charAt(startpos - 1)))
                break;
            startpos--;
        }
        //Now find the end
        endpos = startpos + 1;
        while (endpos <= line.range.end.character) {
            let char = line.text.charAt(endpos);
            if (!Text.is_valid_id_char(char) || char == '.')
                break;
            endpos++;
        }
        return (line.text.slice(startpos, endpos));
    }
    static get_end_word(document, position) {
        let line = document.lineAt(position.line);
        let startpos = 0;
        let endpos = position.character;
        let found_dot = false;
        while (endpos <= line.range.end.character) {
            let char = line.text.charAt(endpos);
            if (!Text.is_valid_id_char(char))
                break;
            endpos++;
        }
        startpos = endpos;
        //Find the beginning of this dotted word group
        //If the last char is not a '.' then it is NOT an end word
        while (startpos - 1 >= 0) {
            let char = line.text.charAt(startpos - 1);
            if (!Text.is_valid_id_char(char))
                break;
            else if (char == '.') {
                found_dot = true;
                break;
            }
            startpos--;
        }
        if (!found_dot)
            return "";
        else
            return line.text.slice(startpos, endpos);
    }
    static get_dotted_words(document, position) {
        let line = document.lineAt(position.line);
        let startpos = position.character;
        let endpos = position.character;
        //Find the beginning of this dotted word group
        while (startpos - 1 >= 0) {
            if (!Text.is_valid_id_char(line.text.charAt(startpos - 1)))
                break;
            startpos--;
        }
        //Now find the end
        while (endpos <= line.range.end.character) {
            if (!Text.is_valid_id_char(line.text.charAt(endpos)))
                break;
            endpos++;
        }
        //Now split according to the '.' character if the selection is valid
        let selection = line.text.slice(startpos, endpos);
        if (selection.length == 0)
            return [];
        let splits = selection.split('.');
        //If the last element is empty, then remove it
        if (splits[splits.length - 1] == "")
            splits.pop();
        return splits;
    }
}
exports.default = Text;
//# sourceMappingURL=Text.js.map