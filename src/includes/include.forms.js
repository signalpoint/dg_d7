d7.showFormErrors = function(msg) {
  var messages = [];
  var data = JSON.parse(msg);
  if (data.form_errors) {
    for (var name in data.form_errors) {
      if (!data.form_errors.hasOwnProperty(name)) { continue; }
      messages.push(data.form_errors[name]);
    }
  }
  else { messages.push(msg); }
  if (messages.length) { dg.alert(messages.join('<br />')); }
};
