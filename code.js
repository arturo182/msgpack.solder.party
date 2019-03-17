function json_to_hex(json) {
	var obj = JSON.parse(json);
	var buff = msgpack.encode(obj);

	return Array.prototype.map.call(buff, function(val) {
		var hex = val.toString(16).toUpperCase();
		if (val < 0x10)
			hex = '0' + hex;

		if (get_hex_separator() != '')
			hex = get_hex_prefix() + hex;

		return hex;
	}).join(get_hex_separator());
}

function hex_to_json(hex) {
	hex = hex.replace(/[\s-,]/gm, '');
	hex = hex.replace(/0x/gm, '');

	var bytes = hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
	var buff = msgpack.decode(new Uint8Array(bytes));

	return JSON.stringify(buff, null, "\t");
}

function reformat_json() {
	var editor = window.json_editor;
	var json = editor.getValue();

	editor.setValue(JSON.stringify(JSON.parse(json), null, "\t"));
}

function compress_json() {
	var editor = window.json_editor;
	var json = editor.getValue();

	editor.setValue(JSON.stringify(JSON.parse(json)));
}

function get_hex_separator() {
	if ($("#sep-space").is(':checked'))
		return ' ';

	if ($("#sep-dash").is(':checked'))
		return '-';

	if ($("#sep-comma").is(':checked'))
		return ', ';

	return '';
}

function get_hex_prefix() {
	if ($("#pref-on").is(':checked'))
		return '0x';

	return '';
}

function on_json_change(instance, _) {
	if (window.updating) {
		window.updating = false;
		return;
	}

	try {
		window.updating = true;
		msgpack_editor.setValue(json_to_hex(instance.getValue()));
	} catch(err) {
		window.updating = true;
		if (instance.getValue().trim() === '') {
			msgpack_editor.setValue("");
		} else {
			msgpack_editor.setValue(err + "");
		}
	}
}

function on_msgpack_change(instance, _) {
	if (window.updating) {
		window.updating = false;
		return;
	}

	try {
		window.updating = true;
		json_editor.setValue(hex_to_json(instance.getValue()));
	} catch(err) {
		window.updating = true;
		if (instance.getValue().trim() === '') {
			json_editor.setValue("");
		} else {
			json_editor.setValue(err + "");
		}
	}
}

function on_radio_change(radio) {
	var opt = radio.id.split('-')[0];
	var val = radio.id;

	Cookies.set(opt, val);

	on_json_change(window.json_editor);
}

$(document).ready(function() {
	window.updating = false;

	var sample = {
		"int": 1,
		"float": 0.5,
		"boolean": true,
		"null": null,
		"string": "foo bar",
		"array": ["foo", "bar"],
		"object": {
			"foo": 1,
			"baz": 0.5
		}
	};

	window.json_editor = CodeMirror.fromTextArea(document.getElementById("json"), {
		mode: "javascript",
		lineNumbers: true,
		lineWrapping: true,
		foldGutter: true,
		styleActiveLine: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
	});

	window.msgpack_editor = CodeMirror.fromTextArea(document.getElementById("msgpack"), {
		mode: null,
		lineNumbers: true,
		lineWrapping: true,
		foldGutter: true,
		styleActiveLine: true,
	});

	window.json_editor.on("changes", on_json_change);
	window.msgpack_editor.on("changes", on_msgpack_change);

	window.json_editor.setValue(JSON.stringify(sample, null, '\t'));

	var cookies = Cookies.get();
	if (cookies['sep'] != '')
		$('#' + cookies['sep']).click()

	if (cookies['pref'] != '')
		$('#' + cookies['pref']).click();
});
