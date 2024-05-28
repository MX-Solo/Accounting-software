$ = require('jquery');
require('popper.js');
require('bootstrap');
const { remote } = require('electron');
const db = require('./db');

db.schema.createTableIfNotExists('accounting' , table => {
    table.increments('id');
    table.string('title');
    table.bigInteger('price');
    table.string('type')
}).then(() => {
    // 
})


$(document).ready(function() {
    showData();

    $('#paymentAndReceiveModal').on('show.bs.modal', function (event) {
        let modal = $(this)
        modal.find('#add-row').on('click' , function(e) {
            let title = modal.find('.modal-body input[name=title]').val();
            let price = modal.find('.modal-body input[name=price]').val();
            let type = modal.find('.modal-body select[name=type]').val();
            
            if(title != '' && price != '' && type != '') {
                addRow({ title , price , type});
                modal.find('form input').val('');
                modal.modal('hide');
            }
        })
    
    
    });

    $('#updateAccount').on('show.bs.modal', function (event) {
        let button = $(event.relatedTarget);
        let id = button.data('id');
        let modal = $(this)

        let idField = modal.find('.modal-body input[name=id]');        
        let titleField = modal.find('.modal-body input[name=title]');
        let priceField = modal.find('.modal-body input[name=price]');
        let typeField = modal.find('.modal-body select[name=type]');

        db('accounting')
            .where('id' , id)
            .first()
            .then(item => {
                
                idField.val(item.id)
                titleField.val(item.title);
                priceField.val(item.price);
                typeField.val(item.type);

                modal.find('#update-row').on('click' , function(event) {
                    let id = idField.val();
                    let title = titleField.val();
                    let price = priceField.val();
                    let type = typeField.val();
                    
                    if(title != '' && price != '' && type != '') {
                        updateRow({ id , title , price , type});
                        modal.find('form input , form select').val('');
                        modal.modal('hide');
                    }

                })


            })


        // modal.find('#add-row').on('click' , function(e) {
        //     let title = modal.find('.modal-body input[name=title]').val();
        //     let price = modal.find('.modal-body input[name=price]').val();
        //     let type = modal.find('.modal-body select[name=type]').val();
            
        //     if(title != '' && price != '' && type != '') {
        //         addRow({ title , price , type});
        //         modal.find('form input').val('');
        //         modal.modal('hide');
        //     }
        // })
    
    
    });

    $(document).on('click' , '.delete-row' , function(e) {
        db('accounting')
            .where('id' , $(this).data('id'))
            .del()
            .then(() => showData())
    });

    $(document).on('click' , 'a.showDetails' , function(e) {
        e.preventDefault();
       
        let detailsWindow = new remote.BrowserWindow({ width : 800  , height : 600});

        detailsWindow.loadURL(`${__dirname}/../views/details.html?id=${$(this).data('id')}`)
        detailsWindow.on('closed', function () {
            detailsWindow = null
        })
    })



    $('#search').submit(function(e) {
        e.preventDefault();
        let keyword = $(this).find('input').first().val();
        db('accounting')
            .where('title' , 'LIKE' , `%${keyword}%`)
            .then(rows => renderDataItem(rows))
    })

})


const addRow = (data) => {
    db('accounting')
        .insert(data)
        .then(() => {
            showData();
        })
}

const updateRow = (data) => {
    let { id , title , price , type }  = data;
    db('accounting')
        .where('id' , id)
        .update({
            title,
            price,
            type
        }).then(() => showData())
}

const showData = () => {
    db('accounting')
        .select('*')
        .orderBy('id' , 'desc')
        .then(rows => renderDataItem(rows));
}


const renderDataItem = (data) => {
    let sectionData = $('#show-data');
    sectionData.empty();
    data.forEach(item => {
        sectionData.append(`
            <tr>
                <th scope="row">${item.id}</th>
                <td><a href="#" class="showDetails" data-id=${item.id}>${item.title}</a></td>
                <td>${item.price} t</td>
                <td class="${item.type == 'payment' ? 'table-danger' : 'table-success'}">${item.type}</td>
                <td>
                    <div class="btn-group">
                        <button type="button" class="btn btn-info" data-toggle="modal" data-target="#updateAccount" data-id=${item.id}>edit</button>
                        <button type="button" class="btn btn-danger delete-row" data-id=${item.id}>delete</button>                        
                    </div>
                </td>
            </tr>
        `)
    });
}