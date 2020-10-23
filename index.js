const builder = require('html-builder')
const style = require('./style')

class JSON_Editor {
    constructor(element) {
        this.element = element
        this.element.addEventListener('keyup', () => this.format(this.element) )
        this.element.contentEditable = true
        this.element.classList.add('JSON_Editor')
        this.format(this.element, false)
    }

    // escape string special characters for regular expressions
    escape_regex_string(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    // return the position of the occurrence-th subString occurrence
    get_position_of_occurrence(string, sub_string, occurrence) {
        const position = string.split(sub_string, occurrence).join(sub_string).length
        return position === string.length ? -1 : position
    }

    // return the number of sub_string occurrences
    get_number_of_occurrences(string, sub_string) {
        return sub_string ? string.replace(new RegExp(`[^${this.escape_regex_string(sub_string)}]`, 'g'), '').length : 0
    }

    // return the element's children text nodes
    get_text_nodes(element) {
        let node, list=[], walk=document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false)
        while(node=walk.nextNode())
            list.push(node)
        return list
    }

    // return a "pointer" with relevant information of the caret position
    get_caret_pointer(element) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
            const range = window.getSelection().getRangeAt(0)
            const caret_range = range.cloneRange()
            caret_range.selectNodeContents(element)
            caret_range.setEnd(range.endContainer, range.endOffset)
            const section = caret_range.toString()
            const character = section[section.length-1]
            const occurrence = this.get_number_of_occurrences(section, character)
            return { character, occurrence, section }
        }
        return null
    }

    // set the caret position based in a pointer information
    set_caret_from_pointer(element, pointer) {
        const selection = window.getSelection()
        const range = document.createRange()
        let nodes_to_explore = this.get_text_nodes(element)
        let occurrence = pointer.occurrence
        let fount_at = 0
        let i=0
    
        for(i=0; i<nodes_to_explore.length; i++) {
            const node = nodes_to_explore[i]
            fount_at = this.get_position_of_occurrence(node.textContent, pointer.character, occurrence)
            if(fount_at >= 0 )
                break
            occurrence -= this.get_number_of_occurrences(node.textContent, pointer.character)
        }

        fount_at++
        range.setStart(nodes_to_explore[i], fount_at)
        range.setEnd(nodes_to_explore[i], fount_at)
        selection.removeAllRanges()
        selection.addRange(range)
    }

    // format the content of an element if it's valid JSON
    format(element, focus = true) {
        const pointer = this.get_caret_pointer(element)
        let content = ''
        try {
            // remove %A0 (NBSP) characters, which are no valid in JSON
            content = element.innerText && JSON.parse(element.innerText.split(unescape('%A0')).join(''))
        }
        catch(exception) {
            console.error(`Format error: ${exception.message}`)
            return
        }
    
        if(!content || JSON.stringify(content) == element.dataset.last_content)
            return
            
        const final = this.json_format(content)
        element.innerHTML = final
        element.dataset.last_content = JSON.stringify(JSON.parse(element.innerText.split(unescape('%A0')).join('')))
        element.dataset.last_content_whitespaces = JSON.stringify(JSON.parse(element.innerText.split(unescape('%A0')).join(' ')))
        element.dataset.innerJSON = element.dataset.last_content_whitespaces
        if(pointer && focus)
            this.set_caret_from_pointer(element, pointer)
    }

    json_format_object(input, offset=0) {
        let final = ''
        final += `<span class="braces">{</span><br>\n`
        final += Object.keys(input).map((key, index, list) => {
            return `${'&nbsp;'.repeat(offset+3)}<span class="key"><span class="quotes">\"</span>${key}<span class="quotes">\"</span></span><span class="colon">:</span><span class="value">${this.json_format(input[key], offset+3)}</span>${index < list.length-1 ? '<span class="comma">,</span>' : ''}<br>\n`
        }).join('')
        final += '&nbsp;'.repeat(offset)
        final += `<span class="braces">}</span>`
        return final
    }
    
    json_format_array(input, offset=0) {
        let final = ''
        final += `<span class="brackets">[</span><br>\n`
        final += input.map((value, index, list) => {
            return `${'&nbsp;'.repeat(offset+3)}<span class="value">${this.json_format(value, offset+3)}</span>${index < list.length-1 ? '<span class="comma">,</span>' : ''}<br>\n`
        }).join('')
        final += '&nbsp;'.repeat(offset)
        final += `<span class="brackets">]</span>`
        return final
    }
    
    json_format_string(input) {
        return `<span class="string"><span class="quotes">\"</span>${input}<span class="quotes">\"</span></span>`;
    }
    
    json_format(input, offset=0) {
        const type = Array.isArray(input) ? 'array' : typeof input
        switch (type) {
            case 'object':
                return this.json_format_object(input, offset)
            case 'array':
                return this.json_format_array(input, offset)
            case 'string':
                return this.json_format_string(input)
            default:
                return input
        }
    }
}

const add_editor = element => new JSON_Editor(element)

exports.JSON_Editor = add_editor

if (window) {
    builder.CSS(style.style)
    window.JSON_Editor = add_editor
}
