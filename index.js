var express = require('express');
var crypto = require('crypto');
var app = express();
var bodyParser = require('body-parser');

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
 }));

//Handle POST request
app.post('/', function(req, res){

	console.log("\n<!------- ******** Request Body ******** -------!>\n" + JSON.stringify(req.body) + "\n<!------- ******** End of Request Body ******** -------!>");
	console.log("\n<!------- ******** Given Params ******** -------!>");
	for(param in req.body.params)
	{
		console.log(param);
	}
	console.log("<!------- ******** End of Given Params ******** -------!>");

	//Verifying signature
	var body = req.body;
	var signature = body.signature;
	delete body.signature;
	var publicKey = '-----BEGIN PUBLIC KEY-----\n'+
			'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AM'+
'IIBCgKCAQEApLufF81FW87VuSwYRqZNEE'+
'XGoVyKx3TBvNbtAU0d5/P9Dwo/aStTsBt'+
'NxOhSOIyOI6ZJpogWaZh19iDYvcYyk1Oi'+
'GGM4Pl8UR0aCV4m5VJsGCkrWXSqtWFLuF'+
'G0v4iI+ASjeew8SDtk6+/2viiVpLLHUUl'+
'mfj1f+C7yFhiZQ0ubfG1dGMRBeuAH12tV'+
'hqGtnZJxMPWSO6O03qivmkPfoU65GcMAY'+
'p5uQCjYgtcxzLWYZsBUp3FEj6w4yygLjq'+
'LTE55hf4NbdjO6W3WI91Dfi1eEzTgfEkg'+
'TrcyF405FjPxhfM3mZyVQSMaGjaR3SdA2'+
'L0KsjGL3BWO0pc2ICggF3lQIDAQAB'+
			'\n-----END PUBLIC KEY-----';
	var verifier = crypto.createVerify('sha256');
	verifier.update(JSON.stringify(body));
	if(typeof signature !== "undefined")
	{
		var result = verifier.verify(publicKey, signature, 'base64');
		console.log("\n<!------- ******** Is valid signature # " + result + " # ******** -------!>");
	}

	var type = req.body.type;
	console.log("\n<!------- ******** type # " + type + " # ******** -------!>");
	var handler = req.body.handler.type;
	console.log("\n<!------- ******** handler # " + handler + " # ******** -------!>");
	var componentName = req.body.name;
	var response = {};
	if(type == "command")	//Command handlers
	{
		if(handler == "execution_handler")		//Command execution handler reponse
		{
			console.log("\n<!------- ******** Inside command execution handler ******** -------!>");
			var output = {};
			if(componentName == "command")	//required consents  -- user
			{
				output = {"text":"Hi " + req.body.params.user.first_name + " ! Slash commands are short cuts to perform tasks. Commands can also provide suggestions, just configure the command suggestion handler! :smile:"};
			}
			else if(componentName == "suggestioncommand")	//required consents  --
			{
				output = {"text":"Hi you have selected " + req.body.params.selections.length + " suggestions and first title is " + req.body.params.selections[0].title};
			}
			else if(componentName == "invokefunctioncmd")	//required consents  -- 	//reqired a function named "function"
			{
				output = {"version":1,"inputs":[{"label":"Name","name":"username","type":"text","value":"Scott Fisher","mandatory":true,"placeholder":"Scott Fisher","hint":"Please enter your name"},{"label":"Email","name":"email","type":"text","value":"scott.fisher@zylker.com","mandatory":true,"format":"email","placeholder":"scott.fisher@zylker.com","hint":"Enter your email address"},{"label":"Asset Type","name":"asset-type","options":[{"label":"Laptop","value":"laptop"},{"label":"Mobile","value":"mobile"}],"type":"select","trigger_on_change":true,"mandatory":true,"placeholder":"Mobile","hint":"Choose your request asset type."}],"name":"ID","type":"form","button_label":"Raise Request","actions":{"submit":{"name":"function","type":"invoke.function"}},"title":"Asset Request","hint":"Raise your asset request."};
			}
			else if(componentName == "invokebtn")	//required consents  --  		//invoke's button function
			{
				//output = {"text":"[What's this?](invoke.function|dreButtonFunction)"};
				output = {"buttons":[{"label":"Create Webhook","type":"+","action":{"confirm":{"description":"Connect to GitLab Projects from within Cliq","title":"Generate Webhooks for a GitLab Project"},"type":"invoke.function","data":{"name":"authentication"}}}],"text":"Click on the token generation button below!"};
			}
			else if(componentName == "attachfuncmd")
			{
				output = {"type":"form","title":"Upload a file","name":"ID","version":1,"button_label":"Upload","actions":{"submit":{"type":"invoke.function","name":"attachForm"}},"inputs":[{"type":"file","name":"file","label":"File to share","hint":"File will be posted in the same chat","placeholder":"","mandatory":true,"multiple":"true"}]};
			}
			else if(componentName == "banner")
			{
				output = {"text":"Testing banner through URL invoke extension","status":"success","type":"banner"};
			}
			else
			{
				output = {"text":"Hi, " + componentName + " is the command name"};
			}
		}
		else if(handler == "suggestion_handler")	//Command suggestion handler response.     			//required consents  --
		{
			console.log("\n<!------- ******** Inside command suggestion handler ******** -------!>");
			output = [{"description":"Command suggestions are helpful when you have to choose from a list of entities!","imageurl":"https://media3.giphy.com/media/Cmr1OMJ2FN0B2/giphy.gif","title":"Tip 1 👋"},{"description":"You can show upto a maximum of 50 command suggestions. :surprise:","imageurl":"https://media2.giphy.com/media/8uzVsRzOScAa4/giphy.gif","title":"Tip 2 😲"}];
		}
	}

	else if(type == "function")	//function handlers
	{
		if(handler == "button_handler")	//Funciton button handler
		{
			output = {"text" : "Isn't the instant button super fantabulous? 😲\nFunctions work with buttons. There are two types of buttons - Message Card Buttons and Instant Buttons."};
		}
		else if(handler == "form_handler")	//Form submit handler response
		{
			console.log("\n<!------- ******** Inside form submit handler ******** -------!>");
			form = req.body.params.form;
			formValues = form.values;
			if(formValues["asset-type"].value == "mobile")
			{
				output = {"text":"Hi " + formValues.username + ", thanks for raising your request. Your request will be processed based on the device availability.","card":{"title":"Asset Request"},"slides":[{"type":"label","title":"","data":[{"Asset Type":formValues["asset-type"].label},{"Preferred OS ":formValues["mobile-os"].label},{"Preferred Device":formValues["mobile-list"].label}]}]};
			}
			else
			{
				output = {"text":"Hi " + formValues.username + ", thanks for raising your request. Your request will be processed based on the device availability.","card":{"title":"Asset Request"},"slides":[{"type":"label","title":"","data":[{"Asset Type":formValues["asset-type"].label},{"OS/Device Preferred":formValues["os-type"].label}]}]};
			}
		}
		else if(handler == "form_change_handler")	//Form change handler response
		{
			console.log("\n<!------- ******** Inside form change handler ******** -------!>");
			var targetName = req.body.params.target.name;
			var inputValues = req.body.params.form.values;
			var actions = [];
			if(targetName  == "asset-type")
			{
				fieldValue = inputValues["asset-type"].value;
				if(fieldValue == "laptop")
				{
					actions.push({"type":"add_after","name":"asset-type","input":{"type":"select","name":"os-type","label":"Laptop Type","hint":"Choose your preferred OS Type","placeholder":"Ubuntu","mandatory":true,"options":[{"label":"Mac OS X","value":"mac"},{"label":"Windows","value":"windows"},{"label":"Ubuntu","value":"ubuntu"}]}});
					actions.push({"type":"remove","name":"mobile-os"});
					actions.push({"type":"remove","name":"mobile-list"});
				}
				else if(fieldValue == "mobile")
				{
					actions.push({"type":"add_after","name":"asset-type","input":{"type":"select","name":"mobile-os","label":"Mobile OS","hint":"Choose your preferred mobile OS","mandatory":true,"placeholder":"Android","options":[{"label":"Android","value":"android"},{"label":"iOS","value":"ios"}],"trigger_on_change":true}});
					actions.push({"type":"remove","name":"os-type"});
				}
			}
			else if(targetName == "mobile-os")
			{
				fieldValue = inputValues["asset-type"].value;
				if(typeof fieldValue !== "undefined")
				{
					actions.push({"type":"add_after","name":"mobile-os","input":{"type":"dynamic_select","name":"mobile-list","label":"Mobile Device","mandatory":true,"placeholder":"Choose your preferred mobile device"}});
				}
				else
				{
					actions.push({"type":"remove","name":"mobile-list"});
				}
			}
			output = {"type":"form_modification","actions":actions};
		}
		else if(handler == "form_values_handler")	//Form dynamic input handler response
		{
			console.log("\n<!------- ******** Inside dynamic input handler ******** -------!>");
			var target = req.body.params.target;
			var form = req.body.params.form;
			var searchValue = target.query;
			if(target.name == "mobile-list" && form.values["mobile-os"])
			{
				var typeList = [];
				var androidDevicesList = ["One Plus 6T","One Plus 6","Google Pixel 3","Google Pixel 2XL"];
				var iOSDevicesList = ["IPhone XR","IPhone XS","IPhone X","Iphone 8 Plus"];
				var deviceType = form.values["mobile-os"].value;
				if(deviceType == "android")
				{

					androidDevicesList.forEach(function(androidDevice) {
				        if(androidDevice.includes(searchValue))
				        {
				        	typeList.push({"label":androidDevice,"value":androidDevice.replace(/\s+/g,"_")});
				        }
				    });
				}
				else
				{
					iOSDevicesList.forEach(function(iOSDevice) {
				        if(iOSDevice.includes(searchValue))
				        {
				        	typeList.push({"label":iOSDevice,"value":iOSDevice.replace(/\s+/g,"_")});
				        }
				    });
				}
			}
			output = {"options" : typeList};
		}
	}

	else if(type == "bot")	//Bot handlers
	{
		if(handler == "welcome_handler")	//Bot welcome handler
		{
			console.log("\n<!------- ******** Inside bot welcome handler ******** -------!>");
			output = {"text" : req.body.name + " bot welcomes you!"};
		}
		else if(handler == "message_handler")	//Bot message handler. 		//required consents  --  message
		{
			console.log("\n<!------- ******** Inside bot message handler ******** -------!>");
			var message = req.body.params.message;
			if(message == "context")
			{
				output = {"context":{"timeout":"300","params":[{"question":"Please enter your name.","name":"name"},{"question":"How old are you? :smile:","name":"age"},{"suggestions":{"list":[{"text":"Male"},{"text":"Female"}]},"question":"Gender:","name":"sex"}],"id":"personal_details"},"text":"Welcome to the Zylker Ticket Booking Portal! I'll need a few details to book the ticket."};
			}
			else
			{
				output = {"text" : "You said " + message};
			}
		}
		else if(handler == "mention_handler")	//Bot mention handler
		{
			console.log("\n<!------- ******** Inside bot mention handler ******** -------!>");
			output = {"text" : "You mentioned me!"};
		}
		else if(handler == "context_handler")	//Bot context
		{
			console.log("\n<!------- ******** Inside bot context handler ******** -------!>");
			var answers = req.body.params.answers;
			var msgString = "Name : " + answers.name.text + "\n";
			msgString = msgString + "Age : " + answers.age.text + "\n";
			msgString = msgString + "Sex : " + answers.sex.text + "\n";
			output = {"text" : "Great! I've got all the info: \n" + msgString};
		}
		else if(handler == "action_handler")	//Bot actions
		{
			console.log("\n<!------- ******** Inside bot action handler ******** -------!>");
			output = {"text" : req.body.handler_name + " bot action performed"};
		}
	}

	else if(type == "messageaction")	//Message action
	{
		console.log("\n<!------- ******** Inside message action handler ******** -------!>");
		output = {"type":"form","title":"Asset Request","hint":"Raise your asset request.","name":"ID","version":1,"button_label":"Raise Request","actions":{"submit":{"type":"invoke.function","name":"form"}},"inputs":[{"type":"text","name":"username","label":"Name","hint":"Please enter your name","placeholder":"Scott Fisher","mandatory":true,"value":"Scott Fisher"}]};
		//output = {"text" : " Message action performed"};
	}

	else if(handler == "installation_handler")	//Installation handler
	{
		console.log("\n<!------- ******** Inside installation handler ******** -------!>");
		output = {"status" : "200","note":["1. for testing.","2. for testing"],"message":"for testing","title":"Success!","footer":"Contact support@zoho.com for any related help / support."};
	}

	else if(handler == "installation_validator")	//Installation validator
	{
		console.log("\n<!------- ******** Inside intallation validator ******** -------!>");
		output = {"status" : "200"};
	}
console.log("\n<!------- ******** type # came here # ******** -------!>");
  else if(type == "widget")	//Widget handlers
	{
    output = {"type":"applet","tabs":[{"label":"All elements","id":"home"},{"label":"All elements (with divider)","id":"all"},{"label":"Button types","id":"buttons"},{"label":"Empty state","id":"empty"},{"label":"Instant Buttons","id":"instant"}],"active_tab":"home","sections":[{"id":1,"elements":[{"type":"title","text":"Title"},{"type":"title","text":"Alter ipsum content here...???"}]},{"id":"01","elements":[{"type":"title","text":"Title with button"},{"type":"title","text":"Alter ipsum content here...???","buttons":[{"label":"Link","type":"open.url","url":"https://www.zoho.com"}]}]},{"id":"011","elements":[{"type":"title","text":"Title with button"},{"type":"title","text":"Alter ipsum content here...???","buttons":[{"label":"Link","type":"open.url","url":"https://www.zoho.com"},{"label":"Edit section","type":"invoke.function","name":"applet","id":"banner"},{"label":"Open Channel","type":"system.api","api":"joinchannel/CD_1283959962893705602_14598233"},{"label":"Preview","type":"preview.url","url":"https://www.zoho.com/cliq/blog/task-management-on-cliq.html"}]}]},{"id":2,"elements":[{"type":"title","text":"Text"},{"type":"text","text":"Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see. Lorem ipsum content here. Lorem ipsum conten"}]},{"id":3,"elements":[{"type":"title","text":"Subtext"},{"type":"subtext","text":"Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see."}]},{"id":4,"elements":[{"type":"title","text":"Divider"},{"type":"divider"}]},{"id":5,"elements":[{"type":"title","text":"Activity"},{"type":"activity","image_url":"https://contacts.zoho.com/file?ID=45013241&t=user&fs=thumb","title":"Deva Gerald","description":"1. You could use me as a notepad to scribble down your to-dos, save important notes; and rest assured whatever you write here will be only between the two of us. You can count on me on this :wink:\nAs and when you need it, all you need to do is search for it in our chat. \n2. You can also share files, images, links that you'd like to store for future use. I'll keep them safe for you. You can reach out to me whenever you need them."}]},{"id":8,"elements":[{"type":"title","text":"Buttons"},{"type":"buttons","buttons":[{"label":"Link","type":"open.url","url":"https://www.zoho.com"},{"label":"Edit section","type":"invoke.function","name":"applet","id":"banner"},{"label":"Open Channel","type":"system.api","api":"joinchannel/CD_1283959962893705602_14598233"},{"label":"Preview","type":"preview.url","url":"https://www.zoho.com/cliq/blog/task-management-on-cliq.html"}]},{"type":"buttons","buttons":[{"label":"Edit section","type":"invoke.function","name":"applet","id":"section"},{"label":"Form Edit Section","type":"invoke.function","name":"applet","id":"formsection"},{"label":"Banner","type":"invoke.function","name":"applet","id":"banner"},{"label":"Edit Whole Tab","type":"invoke.function","name":"applet","id":"tab"},{"label":"Form Edit Tab","type":"invoke.function","name":"applet","id":"formtab"}]}]},{"id":9,"elements":[{"type":"title","text":"Table"},{"type":"table","headers":["Issue ID","Title","Assigned To","Severity","Status"],"rows":[{"Issue ID":"[Zoho3864](https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012802195/)","Title":"I searched as Anand in Global search but the results were only from messages search","Severity":"Major","Status":"Open"},{"Issue ID":"[Zoho3863](https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012802169/)","Title":"Quotes displaying in search","Assigned To":"Amudha Vigneshwaran K M P","Severity":"Major","Status":"Open"},{"Issue ID":"[Zoho3862](https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012802143/)","Title":"Created a new external channel and got this! Tried setting an image twice, the requests failed.","Assigned To":"Avinash B","Severity":"Major","Status":"Open"},{"Issue ID":"[Zoho3861](https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012802107/)","Title":"I opened the chat and pressed esc, now i cant open the chat again","Assigned To":"Aathishithan G","Severity":"Major","Status":"Open"},{"Issue ID":"[Zoho3860](https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012802047/)","Title":"Focus after placeholder.","Assigned To":"Bhim Singh Dangi","Severity":"Major","Status":"Open"},{"Issue ID":"[Zoho3859](https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012802027/)","Title":"Got this Broken UI all of a sudden when i was entering smiley code","Assigned To":"Bhim Singh Dangi","Severity":"Major","Status":"Open"},{"Issue ID":"[Zoho3858](https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012802001/)","Title":"Not able to add comma immediately after a hyperlink. Able to add it only with a space","Assigned To":"Bhim Singh Dangi","Severity":"Major","Status":"Closed"},{"Issue ID":"[Zoho3857](https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012789259/)","Title":"In dark mode, some of the keywords and operators are so dark and not visible in deluge editor.","Assigned To":"Dilip Kumar","Severity":"Major","Status":"Open"}],"style":{"width":[10,50,20,10,10]}}]},{"id":10,"elements":[{"type":"title","text":"Fields"},{"type":"fields","data":[{"Issue ID":"Zoho3765 a@b.com :grinning!:"},{"Title":"Have cleared the conversation the pinned msg is not cleared. If user clicks the pinned message system keeps on loading in chat window."},{"Assigned To":"Veeramani T :smile:"},{"Severity":"Major"},{"Link":"https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012106142/"},{"Status":"Closed"},{"Chumma":"Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see. Lorem ipsum content here. Lorem ipsum conten"}]}]},{"id":11,"elements":[{"type":"title","text":"Fields with Multi Columns"},{"style":{"short":true},"type":"fields","data":[{"Issue ID":"Zoho3765 a@b.com :grinning!:"},{"Title":"Have cleared the conversation the pinned msg is not cleared. If user clicks the pinned message system keeps on loading in chat window."},{"Assigned To":"Veeramani T :smile:"},{"Severity":"Major"},{"Link":"https://projects.zoho.com/portal/2990883#buginfo/218335000000008017/218335000012106142/"},{"Status":"Closed"},{"Chumma":"Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. Lorem ipsum content here. This is a kind of announcement which can be set by anyone for all to see. Lorem ipsum content here. Lorem ipsum conten"}]}]}]};
  }

	response.output = output;
	console.log("\n<!------- ******** Execution Response ******** -------!>\n" + JSON.stringify(response) + "\n<!------- ******** End of Execution Response ******** -------!>");
  	res.send(response);
});

app.listen(process.env.PORT || 5000);
