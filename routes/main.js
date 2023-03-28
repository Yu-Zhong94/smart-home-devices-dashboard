// The main.js file of your application



const { NULL } = require("mysql/lib/protocol/constants/types");



// The main.js file of your application

module.exports = function(app) {
    /**
     * @date 2022-07-09
     *  purpose: render index page. name and branding
     *  inputs: no inputs needed
     *  outputs: index page
     */
    app.get("/",function(req, res){
        res.render("index.html")
    });
    app.get("/index",function(req, res){
        res.render("index.html")
    });

    /**
     * @date 2022-07-09
     *  purpose: render about page. display brief information about developer
     *  inputs: no inputs needed
     *  outputs: about page
     */
    app.get("/about",function(req, res) {
        res.render("about.html");
    });

    /**
     * @date 2022-07-09
     *  purpose: render add device page. display a selector for user to select 
     *           a device to continue and then display a device related form.
     *           After user fill out the form correctly, the form will post data 
     *           to the end.
     *  inputs: device_type, device_name, device_parameters
     *  outputs: new data will be post to TABLE device and TABLE command
     */
    app.get("/devices/add", function (req,res) {
        let newrecord = [req.query.device_type];
        let sqlquery = "SELECT * FROM device_command_type WHERE device_type = ?";
        // PURPOSE: query database for device type related command type
        // INPUTS: device_type
        // OUTPUTS: device_type, command_type
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) return console.error(err.message);
            // render command to the form and render message if there is a message
            res.render("devices/add.html", {device_command_type: result, message: req.flash('message')});
        });
    });
    app.post("/devices/add", function (req,res) {
        let sqlquery = "SELECT * FROM device_type WHERE type_name=?;";
        let newrecord = [req.body.device_type];
        // PURPOSE: get device type id based on device type
        // INPUTS: type_name
        // OUTPUTS: device_type_id
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) return console.error(err.message);
            let device_type_id = result[0].id;
            let sqlquery = "INSERT INTO device (device_name,device_type_id) VALUES(?,?)"
            let newrecord = [req.body.device_name,device_type_id];
            // PURPOSE: insert data on device TABLE and get inserted device id
            // INPUTS: device_type_id, device_name
            // OUTPUTS: insert success, device_id
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) return console.error(err.message);
                let device_id = result.insertId;
                let sqlquery = "SELECT * FROM device_command_type WHERE device_type=?;"
                let newrecord = [req.body.device_type];
                // PURPOSE: get command type based on device type
                // INPUTS: device_type
                // OUTPUTS: command_type,command_id,default_parameter
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err) return console.error(err.message);
                    result.forEach(el => {
                        if (req.body[el.command_type]) {
                            let sqlquery = "INSERT INTO command (device_id,command_type_id,device_parameter) VALUES (?,?,?)";
                            let newrecord = [device_id,el.id,req.body[el.command_type]];
                            // PURPOSE: insert command TABLE a user input
                            // INPUTS: device_parameter, device_id, command_type_id
                            // OUTPUTS: insert success
                            db.query(sqlquery, newrecord, (err, result) => {
                                if (err) return console.error(err.message);
                            });                          
                        }else{
                            let sqlquery = "INSERT INTO command (device_id,command_type_id,device_parameter) VALUES (?,?,?)";
                            let newrecord = [device_id,el.id,el.default_parameter];
                            // PURPOSE: if there are no input, insert command TABLE default value
                            // INPUTS: device_parameter, device_id, command_type_id
                            // OUTPUTS: insert success
                            db.query(sqlquery, newrecord, (err, result) => {
                                if (err) return console.error(err.message);
                            });  
                        }
                    });   
                    // return success message once a device is added and then return to add page. 
                    req.flash('message', "your " + req.body.device_name +" "+ req.body.device_type + " is added to home !");
                    res.redirect("add");  
                });
            });
        });
    });

    /**
     * @date 2022-07-09
     *  purpose: render device status page. display a selector for user to select 
     *           a device to continue and then display a device related information table.
     *  inputs: device_id
     *  outputs: show device_type, device_name, command_type, device_parameter... relate to device_id
     */
    app.get("/devices/index", function(req, res) {
        let sqlquery = "SELECT * FROM device_name_with_type;";
        // PURPOSE: query database to get all the devices
        // INPUTS: no inputs
        // OUTPUTS: device_name , device_type
        db.query(sqlquery, (err, result) => {
            if (err)  console.error(err.message);
            let availableDevices = result;
            let sqlquery = "SELECT * FROM device_name_with_type WHERE device_name_with_type.id = ?;";
            let newrecord = [req.query.device_id];
            let selectedDevice;
            // PURPOSE: find device name and device type by device id
            // INPUTS: device_id
            // OUTPUTS: device_name , device_type
            db.query(sqlquery, newrecord, (err, result) => {
                if (err)  console.error(err.message);
                try {
                    newrecord = result[0].id;
                    selectedDevice = result[0];
                } catch (error) {
                    newrecord = NULL;
                    selectedDevice = NULL;
                }
                let sqlquery = "SELECT * FROM device_parameter_setting WHERE device_id = ?;";
                // PURPOSE: find other relative information by device_id
                // INPUTS: device_id
                // OUTPUTS: command_type, device_parameter
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err)  console.error(err.message);
                    let viewDevice = result;
                    // render all device and selected device
                    res.render("devices/index.html", {Device: selectedDevice, viewDevice: viewDevice,availableDevices: availableDevices});
                });
            });
        });
    });

    /**
     * @date 2022-07-09
     *  purpose: render control device page. display a selector for user to select 
     *           an existing device to continue and then display a filled form.
     *           With client side validation, user change the data in the form and 
     *           update the data to the end.
     *  inputs: device_id, device_name, device_parameters
     *  outputs: new data will be updated to TABLE device and TABLE command
     */
    app.get("/devices/control", function(req, res) {
        let sqlquery = "SELECT * FROM device_name_with_type;";
        // PURPOSE: query database to get all the devices
        // INPUTS: no inputs
        // OUTPUTS: device_name , device_type
        db.query(sqlquery, (err, result) => {
            if (err)  console.error(err.message);
            let availableDevices = result;
            let sqlquery = "SELECT * FROM device_name_with_type WHERE device_name_with_type.id = ?;";
            let newrecord = [req.query.device_id];
            let selectedDevice;
            // PURPOSE: find device name and device type by device id
            // INPUTS: device_id
            // OUTPUTS: device_name , device_type
            db.query(sqlquery, newrecord, (err, result) => {
                if (err)  console.error(err.message);
                try {
                    newrecord = result[0].id;
                    selectedDevice = result[0];
                } catch (error) {
                    newrecord = NULL;
                    selectedDevice = NULL;
                }
                let sqlquery = "SELECT * FROM device_parameter_setting WHERE device_id = ?;";
                // PURPOSE: find other relative information by device_id
                // INPUTS: device_id
                // OUTPUTS: command_type, device_parameter
                db.query(sqlquery, newrecord, (err, result) => {
                    if (err)  console.error(err.message);
                    let viewDevice = result;
                    // render all device , selected device and returned message 
                    res.render("devices/control.html", {Device: selectedDevice, viewDevice: viewDevice,availableDevices: availableDevices,message: req.flash('message')});
                });
            });
        });
    });
    app.post("/devices/control", function (req,res) {
        let sqlquery = "UPDATE device SET device_name = ? WHERE id = ?;";
        let newrecord = [req.body.device_name,req.body.device_id];
        // PURPOSE: update device name by device id
        // INPUTS: device_id, device_name
        // OUTPUTS: update success
        db.query(sqlquery, newrecord, (err, result) => {
            if (err) return console.error(err.message);
            let sqlquery = "SELECT * FROM device_command_type WHERE device_type=?;";
            let newrecord = [req.body.device_type];
            // PURPOSE: get command type based on device type
            // INPUTS: device_type
            // OUTPUTS: command_type, command_id, default_parameter
            db.query(sqlquery, newrecord, (err, result) => {
                if (err) return console.error(err.message);
                result.forEach(el => {
                    if (req.body[el.command_type]) {
                        let sqlquery = "UPDATE command SET device_parameter=? WHERE device_id=? AND command_type_id=?";
                        let newrecord = [req.body[el.command_type], req.body.device_id, el.id];
                        // PURPOSE: update device commands with user inputs
                        // INPUTS: device_parameter, device_id, command_type_id
                        // OUTPUTS: update success
                        db.query(sqlquery, newrecord, (err, result) => {
                            if (err) return console.error(err.message);
                        });                          
                    }else{
                        let sqlquery = "UPDATE command SET device_parameter=? WHERE device_id=? AND command_type_id=?";
                        let newrecord = [el.default_parameter, req.body.device_id, el.id];
                        // PURPOSE: update device command with default inputs
                        // INPUTS: device_parameter, device_id, command_type_id
                        // OUTPUTS: update success
                        db.query(sqlquery, newrecord, (err, result) => {
                            if (err) return console.error(err.message);
                        });  
                    }
                });    
                //return success message once a device is updated and then return to update page.
                req.flash('message', "your " + req.body.device_name +" "+ req.body.device_type + " is updated!");
                res.redirect("control");  
            });
        });
    });

    /**
     * @date 2022-07-09
     *  purpose: render delete device page. display a selector for user to select 
     *           an existing device to delete and then reconfirm the deletion.
     *  inputs: device_id
     *  outputs: delete device data relate to device_id
     */
    app.get("/devices/delete", function(req, res) {
        let sqlquery = "SELECT * FROM device_name_with_type;";
        // PURPOSE: query database to get all the devices
        // INPUTS: no inputs
        // OUTPUTS: all devices with name and type
        db.query(sqlquery, (err, result) => {
            if (err) {
                console.error(err.message);
            }
            let availableDevices = result;
            let sqlquery = "SELECT * FROM device_name_with_type WHERE device_name_with_type.id = ?;";
            let newrecord = [req.query.device_id];
            let selectedDevice;
            // PURPOSE: get device information by device id for deletion reconfirm modal.
            // INPUTS: device_id
            // OUTPUTS: selected device with name and type
            db.query(sqlquery, newrecord, (err, result) => {
                if (err)  console.error(err.message);
                try {
                    selectedDevice = result[0];
                } catch (error) {
                    selectedDevice = NULL;
                }
                // render all device , selected device and returned message 
                res.render("devices/delete.html", {Device: selectedDevice,availableDevices: availableDevices,message: req.flash('message')});
            });
        });
    });
    app.post("/devices/delete", function(req, res) {
        let sqlquery2 = "DELETE FROM command WHERE device_id=?;";
        let newrecord = [req.body.device_id];
        // PURPOSE: delete commands related to the device id.
        // INPUTS: device_id
        // OUTPUTS: deleted success
        db.query(sqlquery2, newrecord, (err, result) => {
            if (err) {
                console.error(err.message);
            }
        });
        let sqlquery1 = "DELETE FROM device WHERE id=?;";
        // PURPOSE: delete device related to the device id.
        // INPUTS: device_id
        // OUTPUTS: deleted success
        db.query(sqlquery1, newrecord, (err, result) => {
            if (err) {
                console.error(err.message);
            }
        });
        //return success message once a device is deleted and then return to delete page.
        req.flash('message', "your " + req.body.device_name +" "+ req.body.device_type + " is deleted!");
        res.redirect("delete"); 
    });
   }