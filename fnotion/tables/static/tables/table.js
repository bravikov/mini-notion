const csrf_token = document.querySelector('[name=csrfmiddlewaretoken]').value;

function delete_column_button_cell(column_id)
{
    var delete_button = $("<button type=\"button\" class=\"delete-column btn btn-warning btn-sm\">−</button>")
    delete_button.attr('column-id', column_id)
    var column_element = $("<th>").append(delete_button);
    return column_element;
}

function render_table(json)
{
    var table_name_element = $('#table-name');
    table_name_element.text(json.name);

    var columns_element = $("#fnotion_columns");
    columns_element.html('');

    // Вставляем кнопки для удаления колонок.
    var delete_buttons_row = $('<tr id="delete_column_button_row">');
    delete_buttons_row.append($("<th>")) // Колонка для кнопки удаления строки.
    for (const column of json.columns) {
        delete_buttons_row.append(delete_column_button_cell(column.id));
    }
    columns_element.append(delete_buttons_row);

    $(".delete-column").click(function() {
        const column_id = $(this).attr('column-id');
        $.ajax({
            headers: {'X-CSRFToken': csrf_token},
            method: 'POST',
            url: 'delete_column',
            data: {'column_id': column_id}
        })
            .done(function(json) {
                render_table(json);
            });
    });

    // Вставляем имена колонок.
    var column_name_row = $('<tr id="column_name_row">');
    column_name_row.append($("<th>")) // Колонка для кнопки удаления строки.
    for (const column of json.columns) {
        var cell = $('<th class="edit-cell edit-column-name" scope="col">');
        cell.append(column.name);
        cell.attr('column-id', column.id)
        column_name_row.append(cell)
    }
    columns_element.append(column_name_row);

    // Кликаем на имя колонки, чтобы его отредактировать.
    $('.edit-column-name').click(function() {
        $('.edit-cell').unbind('click');
        var cell_element = $(this);
        const column_id = cell_element.attr('column-id');
        var input_element = $('<input type="text" id="edited-field">');
        input_element.attr('value', cell_element.text());
        input_element.attr('column-id', column_id);

        // Кликаем в любом месте страницы, чтобы имя колонки сохранилось.
        input_element.focusout(function() {
            $.ajax({
                headers: {'X-CSRFToken': csrf_token},
                method: 'POST',
                url: 'edit_column_name',
                data: {
                    'column_id': column_id,
                    'name': $(this).val(),
                },
            })
                .done(function(json) {
                    render_table(json);
                });
        });

        $(this).html(input_element);
        input_element.focus();
    });

    var rows_element = $("#fnotion_rows")
    rows_element.html("")
    for (const row of json.rows) {
        var row_element =  $("<tr class=\"fnotion_row\">")
        var delete_button = $("<button type=\"button\" class=\"delete-row btn btn-warning btn-sm\">−</button>")
        delete_button.attr("row-id", row.id)
        row_element.append($("<td>").append(delete_button))
        for (const cell of row.data) {
            cell_element = $('<td class="edit-cell edit-data">').append(cell.value);
            cell_element.attr("cell-id", cell.id);
            row_element.append(cell_element);
        }
        rows_element.append(row_element)
    }

    $(".delete-row").click(function() {
        const row_id = $(this).attr('row-id');
        $.ajax({
            headers: {'X-CSRFToken': csrf_token},
            method: 'POST',
            url: 'delete_row',
            data: {'row_id': row_id}
        })
            .done(function(json) {
                render_table(json);
            });
    });

    // Кликаем на ячейку, чтобы ее отредактировать.
    $('.edit-data').click(function() {
        $('.edit-cell').unbind('click');
        var cell_element = $(this);
        const cell_id = cell_element.attr('cell-id');
        var input_element = $('<input type="text" id="edited-field">');
        input_element.attr('value', cell_element.text());
        input_element.attr('cell-id', cell_id);

        // Кликаем в любом месте страницы, чтобы ячейка сохранилась.
        input_element.focusout(function() {
            $.ajax({
                headers: {'X-CSRFToken': csrf_token},
                method: 'POST',
                url: 'edit_cell',
                data: {
                    'cell_id': cell_id,
                    'value': $(this).val(),
                },
            })
                .done(function(json) {
                    render_table(json);
                });
        });

        $(this).html(input_element);
        input_element.focus();
    });
}

function render_table_list(tables)
{
    var tables_list_element = $('#table-list');
    tables_list_element.html('');
    for (const table of tables) {
        var table_element = $('<li class="list-group-item">');
        var table_link = $('<a>');
        table_link.attr('href', '/tables/' + table.id);
        table_link.text(table.name);
        table_element.append(table_link);
        table_element.attr('table-id', table.id);
        tables_list_element.append(table_element);
    }
}

$(document).ready(function() {
    $.ajax({
        headers: {'X-CSRFToken': csrf_token},
        method: 'POST',
        url: '/tables/get_tables',
        data: {},
    })
        .done(function(json) {
            var tables = json.tables;
            render_table_list(tables);
        });

    $.ajax({
        headers: {'X-CSRFToken': csrf_token},
        method: 'POST',
        url: 'get_table',
        data: {},
    })
        .done(function(json) {
            render_table(json);
        });
});

$('#add_column').click(function() {
    var column_name_row = $("#column_name_row");
    var input_element = $('<input type="text">');
    input_element.val('Новая колонка');
    column_element = $("<th>");
    column_element.append(input_element);
    column_name_row.append(column_element);
    input_element.focus();

    // Кликаем в любом месте страницы, чтобы ячейка сохранилась.
    input_element.focusout(function() {
        column_name = $(this).val();

        $.ajax({
            headers: {'X-CSRFToken': csrf_token},
            method: 'POST',
            url: 'add_column',
            data: {'column_name': column_name},
        })
            .done(function(json) {
                render_table(json);
            });
    });
});

$('#add_row').click(function() {
    $.ajax({
        headers: {'X-CSRFToken': csrf_token},
        method: 'POST',
        url: 'add_row',
    })
        .done(function(json) {
            render_table(json);
        });
});

$('#add-table').click(function() {
    var table_list_element = $("#table-list");
    var input_element = $('<input type="text" class="col-sm-10">');
    input_element.val('Новая таблица');
    var table_element = $('<li class="list-group-item">');
    table_element.append(input_element);
    table_list_element.append(table_element);
    input_element.focus();

    // Кликаем в любом месте страницы, чтобы таблица создалась.
    input_element.focusout(function() {
        table_name = $(this).val();

        $.ajax({
            headers: {'X-CSRFToken': csrf_token},
            method: 'POST',
            url: '/tables/add_table',
            data: {'name': table_name},
        })
            .done(function(json) {
                window.location.replace('/tables/' + json.table.id);
                render_table_list(json.tables.tables);
                render_table(json.table);
            });
    });
});
