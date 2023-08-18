const tbodyElm = $('#tbl-items tbody');
const modalElm = $('#new-item-modal');
const txtId = $('#txt-id');
const txtDescription = $('#txt-description');
const txtUnitPrice = $('#txt-unit-price');
const txtInitialStock = $('#txt-initial-stock');
const btnSave = $('#btn-save');

tbodyElm.empty();

function formatItemId(id) {
    return `I${id.toString().padStart(3, '0')}`;
}

[txtDescription, txtInitialStock, txtUnitPrice].forEach(txtElm => $(txtElm).addClass('animate__animated'));

btnSave.on('click', () => {
    if (!validateData()) {
        return false;
    }

    const id = txtId.val().trim();
    const description = txtDescription.val().trim();
    const initialStock = txtInitialStock.val().trim();
    const unitPrice = txtUnitPrice.val().trim();

    let item = {
        description, initialStock, unitPrice
    };

    /*1. Create XHR Object*/
    const xhr = new XMLHttpRequest();

    /*2. Set an event Listener to listen readystatechange*/
    xhr.addEventListener('readystatechange', () => {
        if(xhr.readyState === 4) {
            [txtDescription, txtUnitPrice, txtInitialStock, btnSave].forEach(elm => elm.removeAttr('disabled'));
            $('#loader').css('visibility', 'hidden');
            if(xhr.status === 201) {
                item = JSON.parse(xhr.responseText);
                getItems(true);
                // tbodyElm.append(`
                // <tr>
                //     <td class="text-center">${formatItemId(item.id)}</td>
                //     <td>${item.description}</td>
                //     <td class="d-none d-xl-table-cell">${item.unitPrice}</td>
                //     <td class="contact text-center">${item.initialStock}</td>
                //     <td>
                //         <div class="actions d-flex gap-3 justify-content-center">
                //             <svg data-bs-toggle="tooltip" data-bs-title="Edit Item" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                //                 class="bi bi-pencil-square" viewBox="0 0 16 16">
                //                 <path
                //                     d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                //                 <path fill-rule="evenodd"
                //                     d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                //             </svg>
                //             <svg data-bs-toggle="tooltip" data-bs-title="Delete Item" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                //                 class="bi bi-trash" viewBox="0 0 16 16">
                //                 <path
                //                     d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                //                 <path
                //                     d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                //             </svg>
                //         </div>
                //     </td>
                // </tr>
                // `);
                resetForm(true);
                txtDescription.trigger('focus');
                showToast('success', 'Success', 'Item has been saved successfully');
            } else {
                // resetForm(false);
                const errorObj = JSON.parse(xhr.responseText);
                showToast('error', 'Failed', 'Item already exist');
            }
        }
    })

    /*3. Let's open the request*/
    xhr.open('POST', 'http://localhost:8080/pos/api/v1/items', true);

    /*4. Let's set some request headers*/
    xhr.setRequestHeader('Content-Type', 'application/json');

    showProgress(xhr);

    /*5. Okay, time to send the request*/
    xhr.send(JSON.stringify(item));

    [txtDescription, txtUnitPrice, txtInitialStock, btnSave].forEach(elm => elm.attr('disabled', 'true'));
    $('#loader').css('visibility', 'visible');

});

function validateData() {
    const unitPrice = txtUnitPrice.val().trim();
    const initialStock = txtInitialStock.val().trim();
    const description = txtDescription.val().trim();
    let valid = true;
    resetForm(false);

    /* UNITPRICE VALIDATE */
    if(!unitPrice) {
        valid = invalidate(txtUnitPrice, 'Unit Price cannot be empty');
        valid = false;
    } else if (!/^[0-9]+$/.test(unitPrice)) {
        valid = invalidate(txtUnitPrice, 'Invalid Unit Price');
    }

    if(!initialStock) {
        valid = invalidate(txtInitialStock, 'Initial Stock cannot be empty');
        valid = false;
    } else if (!/^[0-9]+$/.test(initialStock)) {
        valid = invalidate(txtInitialStock, 'Invalid Initial Stock');
    }

    if(!description) {
        valid = invalidate(txtDescription, 'Description cannot be empty');
        valid = false;
    } else if (!/^(.)+$/.test(description)) {
        valid = invalidate(txtDescription, 'Invalid Description');
    }
    return valid;
}

function invalidate(txt, msg) {
    setTimeout(() => txt.addClass('is-invalid animate__shakeX'), 0);;
    txt.trigger('select');
    txt.next().text(msg);
    return false;

}

function resetForm(clearData) {
    [txtInitialStock, txtDescription, txtUnitPrice].forEach(txt => {
        txt.removeClass('is-invalid animate__shakeX');
        if(clearData) txt.val('');
    })
}

modalElm.on('show.bs.modal', () => {
    resetForm(true);
    txtId.parent().hide();
    setTimeout(() => {
        txtDescription.trigger('focus');
    }, 500);
});
function showToast(toastType, header, message) {
    $('#toast .toast').removeClass('text-bg-success text-bg-warning text-bg-danger');
    switch (toastType) {
        case 'success':
            $('#toast .toast').addClass('text-bg-success');
            break;
        case 'warning':
            $('#toast .toast').addClass('text-bg-warning');
            break;
        case 'error':
            $('#toast .toast').addClass('text-bg-danger');
            break;
        default:

    }
    $('#toast .toast-header > strong').text(header);
    $('#toast .toast-body').text(message);
    $('#toast .toast').toast('show');

};

function getItems() {
    const xhr = new XMLHttpRequest();

    xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
            if (xhr.status == 200) {
                tbodyElm.empty();
                const itemList = JSON.parse(xhr.responseText);
                itemList.forEach(item => {
                    tbodyElm.append(`
                        <tr>
                            <td class="text-center">${formatItemId(item.id)}</td>
                            <td>${item.description}</td>
                            <td class="d-none d-xl-table-cell">${item.unitPrice}</td>
                            <td class="contact text-center">${item.initialStock}</td>
                            <td>
                                <div class="actions d-flex gap-3 justify-content-center">
                                    <svg data-bs-toggle="tooltip" data-bs-title="Edit Item" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                        class="bi bi-pencil-square edit" viewBox="0 0 16 16">
                                        <path
                                            d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                        <path fill-rule="evenodd"
                                            d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                                    </svg>
                                    <svg data-bs-toggle="tooltip" data-bs-title="Delete Item" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                        class="bi bi-trash delete" viewBox="0 0 16 16">
                                        <path
                                            d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                        <path
                                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                    </svg>
                                </div>
                            </td>
                        </tr>
                        `);
                });
                const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
                const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
                if (!itemList.length) {
                    $('#tbl-items tfoot').show();
                } else {
                    $('#tbl-items tfoot').hide();
                }
            } else {
                tbodyElm.empty();
                $('#tbl-items tfoot').show();
                showToast('error', 'Failed', 'Failed to fetch items');
                console.log(JSON.parse(xhr.responseText));
            }
        }
    });

    const searchText = $('#txt-search').val().trim();
    const query = (searchText) ? `?q=${searchText}` : '';

    xhr.open('GET', 'http://localhost:8080/pos/api/v1/items' + query, true);

    const tfoot = $("#tbl-items tfoot tr td:first-child");
    xhr.addEventListener('loadstart', ()=> tfoot.text('Please wait!'));
    xhr.addEventListener('loadend', ()=> tfoot.text('No customer records are found!'));

    xhr.send();
}

getItems();

$('#txt-search').on('input', () => getItems());

function showProgress(xhr){
    const progressBar =  $("#progress-bar");
    xhr.addEventListener('loadstart', ()=> progressBar.width('5%'));
    xhr.addEventListener('progress', (eventData)=> {
        const downloadedBytes = eventData.loaded;
        const totalBytes = eventData.total;
        const progress = downloadedBytes / totalBytes * 100;
        progressBar.width(`${progress}%`);
    });
    xhr.addEventListener('loadend', ()=> {
        progressBar.width('100%');
        setTimeout(()=> progressBar.width('0%'), 500);
    });
}

tbodyElm.on('click', ".delete", (eventData)=> {
    /* XHR -> jQuery AJAX */
    const id = +$(eventData.target).parents("tr").children("td:first-child").text().replace('I', '');
    const xhr = new XMLHttpRequest();
    const jqxhr = $.ajax(`http://localhost:8080/pos/api/v1/items/${id}`, {
        method: 'DELETE',
        xhr: ()=> xhr           // This is a hack to obtain the xhr that is used by jquery
    });
    showProgress(xhr);
    jqxhr.done(()=> {
        showToast('success', 'Deleted', 'Item has been deleted successfully');
        $(eventData.target).tooltip('dispose');
        setTimeout(() => {getItems()}, 100);
    });
    jqxhr.fail(()=> {
        showToast('error', 'Failed', "Failed to delete the customer, try again!");
    });
});