$ = require('jquery');
require('popper.js');
require('bootstrap');
const { remote } = require('electron');
const db = require('./db');
const queryString = require('query-string');
const { dialog } = remote;
const fs = require('fs');

$(document).ready(function() {
    const params = queryString.parse(location.search);
    
    db('accounting')
        .where('id' , params.id)
        .first()
        .then(item => {
            let sectionData = $('#show-data');
            sectionData.empty();
            sectionData.append(`
                <tr>
                    <th scope="row">${item.id}</th>
                    <td>${item.title}</td>
                    <td>${item.price} t</td>
                    <td class="${item.type == 'payment' ? 'table-danger' : 'table-success'}">${item.type}</td>
                </tr>
            `)
        })

    $('#printToPDF').click(function(event) {
        dialog.showSaveDialog(remote.getCurrentWindow() , {} , filePath => {
            if(filePath) {
                remote.getCurrentWebContents().printToPDF({} , (error , data) => {
                    if(error) console.log(error);
                    fs.writeFile(filePath , data , (err) => {
                        if(err) console.log(err);
                        console.log('Write PDF successfully')
                    })
                })
            }
        })
    })

    $('#print').click(function(event) {
        remote.getCurrentWebContents().print();
    })
});