/*

basic structure

compressed
[[?x::x::x::x]]

un-compressed
[[?x::x::
	x
::
	x
]]

also note NON-conditional syntax e.g. [[S51:page-name]] OR [[S8]] OR [[E130:[[T8:[[S50:Cookie]]]] dup dup "frId=" indexof 5 + swap length substring dup 0 swap ";" indexof substring]]
these remain in tact but would be nice to put *groups on new lines
*groups == where pairs of "[[" AND "]]" match e.g. "[[..]]" OR "[[..[[..]]]]"


version 1 compressed
[[?xxnullx::x[[S42:0:fr-id]]x:: <!-- no id --> [[U0:TeamRaiserID=[[S80:trID]]]]::[[U0:TeamRaiserID=[[S42:0:fr-id]]]]]]

version 1 un-compressed
[[?xxnullx::x[[S42:0:fr-id]]x::
	<!-- no id -->
	[[U0:TeamRaiserID=[[S80:trID]]]]
::
	[[U0:TeamRaiserID=[[S42:0:fr-id]]]]
]]

version 2 compressed
[[?[[?[[S8]]::team_id::T::]][[?[[S8]]::pg=personal::T::]]::T::<!-- Team or personal page -->[[S51:RFL_FY12_styles]][[S51:RFL_FY12_styles_team]]:: [[?[[S8]]::pg=company::<!--Company page 555555555555  -->[[S51:RFL_FY12_styles]][[S51:RFL_FY12_styles_company]]:: [[S51:RFL_FY12_styles]][[S51:RFL_FY12_reus_head]]]]]]

version 2 un-compressed
[[?[[?[[S8]]::team_id::T::]][[?[[S8]]::pg=personal::T::]]::T::
	<!-- Team or personal page -->
	[[S51:RFL_FY12_styles]][[S51:RFL_FY12_styles_team]]
::
	[[?[[S8]]::pg=company::
		 <!--Company page 555555555555  -->
		 [[S51:RFL_FY12_styles]][[S51:RFL_FY12_styles_company]]
	::
		[[S51:RFL_FY12_styles]][[S51:RFL_FY12_reus_head]]
	]]
]]

version 3 compressed
[[?xxnullx::x[[S334:FR_ID]]x::[[?xxnullx::x[[S334:fr_id]]x::[[?xRR_FY12_PC2x::x[[S334:pagename]]x::[[U0:TeamRaiserID=[[E130:[[T8:[[S50:Cookie]]]] dup dup "frId=" indexof 5 + swap length substring dup 0 swap ";" indexof substring]]]]::[[?xxnullx::x[[S42:0:fr-id]]x::<!-- no id -->[[U0:TeamRaiserID=[[S80:trID]]]]::[[U0:TeamRaiserID=[[S42:0:fr-id]]]]]]]]::<!-- id in fr_id = x[[S334:fr_id]]x -->[[U0:TeamRaiserID=[[S334:fr_id]]]]]]::<!-- id in FR_ID = x[[S334:FR_ID]]x -->[[U0:TeamRaiserID=[[S334:FR_ID]]]]]]

version 3 un-compressed
[[?xxnullx::x[[S334:FR_ID]]x::
	[[?xxnullx::x[[S334:fr_id]]x::
		[[?xRR_FY12_PC2x::x[[S334:pagename]]x::
			[[U0:TeamRaiserID=[[E130:[[T8:[[S50:Cookie]]]] dup dup "frId=" indexof 5 + swap length substring dup 0 swap ";" indexof substring]]]]
		::
			[[?xxnullx::x[[S42:0:fr-id]]x::
				<!-- no id -->
				[[U0:TeamRaiserID=[[S80:trID]]]]
			::
				[[U0:TeamRaiserID=[[S42:0:fr-id]]]]
			]]
		]]
	::
		<!-- id in fr_id = x[[S334:fr_id]]x -->
		[[U0:TeamRaiserID=[[S334:fr_id]]]]
	]]
::
	<!-- id in FR_ID = x[[S334:FR_ID]]x -->
	[[U0:TeamRaiserID=[[S334:FR_ID]]]]
]]

	token constant list = ['EOF', 'IF', 'DBL_BRACKET_OPEN', 'DBL_BRACKET_CLOSE', 'DBL_COLON']
	return will be [c, p, 'TOKEN'] -> c === character, p === ('PRINT_BEFORE' | 'PRINT_AFTER'), 'TOKEN' === token constant list
	conditional === [[?x::x::...::...]]
	look for '[[?' -> donotes the start of an IF statements === 'if ('
	note: conditional (C) can be within ANY part of another conitional e.g. [[?(C)::(C)::(C)::(C)]]
	1. if '[[?' found then start_if += 1, dbl_colons = 0
	2. count double colons -> dbl_colons += 1
		a. if '[[?' found then start_if += 1, dbl_colons == 0; - GOTO step 2
	3. if dbl_colons === 2 then dbl_colons = 0, ifbody = true
	4. if '[[?' found then GOTO step 1 else if '::' found then if_else = true elseif '[[?' found then GOTO step 1
	5. if ']]' found then start_if -= 1 elseif '[[?' found then GOTO step 1

*/

(function( window ) {

var convio_beautify = function( src, options ) {

    function in_array(what, arr) {
        for (var i = 0; i < arr.length; i += 1) {
            if (arr[i] === what) {
                return true;
            }
        }
        return false;
    }

    function trim(s) {
        return s.replace(/^\s\s*|\s\s*$/, '');
    }

	function indent() {
		indentation += 1;
	}

	function removeIndent() {
		indentation -= 1;
	}

	function printNewLine() {
		new_line_was_made = true;
		output.push('\n');
		for ( var i=0; i<indentation; i++ ) {
			output.push('\t');
		}
	}

	function printToken() {
		new_line_was_made = false;
		output.push(token_text);
	}

	function getToken() {

		if ( pos >= input_length ) {
			return ['', 'EOF'];
		}

		function cat(p) {
			return pos < input_length ? input.charAt((pos - 1) + p) : '';
		}

		var m3 = pos > 0 ? input.charAt(pos - 3) : '';
		var m2 = pos > 0 ? input.charAt(pos - 2) : '';
		var m1 = pos > 0 ? input.charAt(pos - 1) : '';
		var c = input.charAt(pos);
		var c1 = pos < input_length ? input.charAt(pos + 1) : '';
		var c2 = pos < input_length ? input.charAt(pos + 2) : '';
		var c3 = pos < input_length ? input.charAt(pos + 3) : '';
		var c4 = pos < input_length ? input.charAt(pos + 4) : '';
		var c5 = pos < input_length ? input.charAt(pos + 5) : '';
		pos += 1;

        if (c === '<' && input.substring(pos - 1, pos + 3) === '<!--') {
            pos += 3;
            flags.in_html_comment = true;
            return ['<!--', 'HTML_COMMENT_OPEN'];
        }

        if (c === '-' && flags.in_html_comment && input.substring(pos - 1, pos + 2) === '-->') {
            flags.in_html_comment = false;
            pos += 2;
            if ( wanted_newline ) {
                printNewLine();
            }
            return ['-->', 'HTML_COMMENT_CLOSE'];
        }

		if ( c === ']' && c1 === ']' ) {
			/* looking for "]]  [[" but not "]]  [[?" */
			if ( m1 != ' ' || m1 != ':' ) {
//				console.log(cat(4))
//				console.log(m3, m2, m1, c, c1, c2, c3, c4, cat(1));
//				if ( c4 === '[' && c5 === '[' && cat(6) != '?' ) {
//					console.log(c, '++', m3, m2, m1, c, c1, c2, c3, c4, cat(1));
//					pos += 5;
//					return ['', 'TWO_CNVO_EXPRESSIONS'];
//				}
			}
			return [c, 'DBL_BRACKET_CLOSE'];
		}
		if ( c === ':' && c1 === ':' ) {
			if ( c2 === ':' || c3 === ':' || c2 === ']' || c3 === ']' ) {
				no_body = true;
			}
			if ( if_body ) {
				pos += 1;
				return ['::', 'DBL_COLON_ELSE'];
			}
			pos += 1;
			return ['::', 'DBL_COLON'];
		}
		if ( c === '[' && c1 === '[' && c2 === '?' ) {
			pos += 2;
			return ['[[?', 'IF'];
		}
		if ( c === '[' && c1 === '[' && c2 != '?' ) {
			return [c, 'DBL_BRACKET_OPEN'];
		}
		if ( c === '<' ) {
			var n = input.charAt(pos);
			if ( in_array(n, wordchar) ) {
				if (pos < input_length) {
					while (in_array(input.charAt(pos), wordchar)) {
						c += input.charAt(pos);
						pos += 1;
						if (pos === input_length) {
							break;
						}
					}
				}
				return [c, 'HTML'];
			}
		}
		return [c, 'CHAR'];
	}

	var input = src;
	input = trim(input.replace(/\[\[(?!\?)/g, ' [[').replace(/\]\]/g, ']] '));

	var input_length = input.length;
	var output = [];
	var pos = 0;
	var token_text = prev_char = prev_prev_char = word = '';
	var ifs = if_bodies = if_elses = dbl_colons = indentation = dbl_brackets = 0;
	var wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

	var if_body = if_else = if_found = no_body = new_line_was_made = false;
	var flags = {
		in_html_comment: false
	};
	var wanted_newline = false;

	while ( true ) {
		var t = getToken();
		token_text = t[0];
		token_type = t[1];

        if ( token_type === 'EOF' ) {
            break;
        }
		switch ( token_type ) {
			case 'HTML': {
				if ( !new_line_was_made ) {
					printNewLine();
				}
				printToken();
				break;
			}
			case 'IF': {
				if_found = true;
				if_body = false;
				ifs += 1;
				dbl_colons = 0;
				printToken();
				break;
			}
			case 'DBL_COLON': {
				dbl_colons += 1;
				if ( dbl_colons === 2 ) {
					if_bodies += 1;
					printToken();
					if ( !no_body || ifs == if_bodies ) {
						indent();
						printNewLine();
					}
					if_found = false;
					if_body = true;
					dbl_colons = 0;
					break;
				} else {
					printToken();
				}
				break;
			}
			case 'DBL_COLON_ELSE': {
				if_body = false;
				if_bodies -= 1;
				if_else = true;
				if_elses += 1;
				dbl_colons = 0;
				if ( !no_body ) {
					removeIndent();
					printNewLine();
					printToken();
					indent();
					printNewLine();
				} else {
					printToken();
				}
				break;
			}
			case 'DBL_BRACKET_OPEN': {
				dbl_brackets += 1;
				printToken();
				break;
			}
			case 'DBL_BRACKET_CLOSE': {
				dbl_brackets -= 1;
				if ( if_else && dbl_brackets < 0 ) {
					if ( !no_body || ifs == if_elses ) {
						if_body = true;
						removeIndent();
						printNewLine();
					}
					if_elses -= 1;
					ifs -= 1;
					if ( ifs <= 0 ) {
						if_else = false;
					}
					dbl_brackets = 0;
				}
				printToken();
				no_body = false;
				break;
			}
			case 'TWO_CNVO_EXPRESSIONS': {
				dbl_brackets -= 1;
				output.push(']]');
				printNewLine();
				indent();
				printNewLine();
				output.push('[[');
				break;
			}
			case 'HTML_COMMENT_OPEN': {
				if ( !new_line_was_made ) {
					printNewLine();
				}
				printToken();
				break;
			}
			case 'HTML_COMMENT_CLOSE': {
				printToken();
				printNewLine();
				break;
			}
			case 'CHAR': {
				printToken();
				break;
			}
		}
		prev_prev_char = prev_char;
		prev_char = token_text;

	}
	//var sweet_code = preindent_string + output.join('').replace(/[\n ]+$/, '');
	var sweet_code = output.join('').replace(/[\n ]+$/, '');
	sweet_code = sweet_code.replace(/\s\[\[(?!\?)/g, '[[').replace(/\]\]\s/g, ']]');
	return sweet_code;
}

window.convio_beautify = convio_beautify;

})( window );
