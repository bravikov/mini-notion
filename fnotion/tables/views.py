from django.http import HttpResponse, Http404, JsonResponse
from django.template import loader
from dataclasses import dataclass, field, asdict

from .models import Table, Column, Data, Row, Document


@dataclass
class ResultTable:
    """Информация, которую возвращает API об одной таблице."""
    id: int = 0
    name: str = ""


@dataclass
class ResultTables:
    """Информация, которую возвращает API о таблицах."""
    tables: list[ResultTable] = field(default_factory=list)


@dataclass
class ResultCell:
    """Информация, которую возвращает API о ячейке."""
    id: int = 0
    value: str = ""


@dataclass
class ResultRow:
    """Информация, которую возвращает API о строке."""
    id: int = 0
    data: list[ResultCell] = field(default_factory=list)


@dataclass
class ResultColumn:
    """Информация, которую возвращает API о колонке."""
    id: int = 0
    name: str = ""


def index(request):
    tables = Table.objects.all()
    template = loader.get_template('tables/index.html')
    context = {
        'tables': tables,
    }
    return HttpResponse(template.render(context, request))


def select_tables():
    tables = Table.objects.all()
    result_tables = ResultTables()
    for table in tables:
        result_table = ResultTable(table.id, table.name)
        result_tables.tables.append(result_table)
    return asdict(result_tables)


def get_tables(request):
    return JsonResponse(data=select_tables())


def add_table(request):
    name = request.POST['name']
    new_table = Table.objects.create(name=name)
    response = {
        'tables': select_tables(),
        'table': select_table(new_table.id),
    }
    return JsonResponse(data=response)


def table_page(request, table_id):
    template = loader.get_template('tables/table.html')
    context = {}
    return HttpResponse(template.render(context, request))


def select_table(table_id):
    try:
        table = Table.objects.get(pk=table_id)
    except Column.DoesNotExist:
        raise Http404("Table does not exist")
    columns = Column.objects.filter(table=table)
    rows = Row.objects.filter(table=table)
    data = Data.objects.filter(row__table=table).order_by('row')

    result_rows = []
    data_i = 0
    for row in rows:
        result_row = ResultRow()
        result_row.id = row.id
        for column_i in range(len(columns)):
            result_data = ResultCell()
            result_data.id = data[data_i].id
            result_data.value = data[data_i].value
            result_row.data.append(result_data)
            data_i += 1
        result_rows.append(asdict(result_row))

    result_columns = []
    for column in columns:
        result_columns.append(asdict(ResultColumn(column.id, column.name)))

    return {
        'id': table.id,
        'name': table.name,
        'columns': result_columns,
        'rows': result_rows,
    }


def get_table(request, table_id):
    return JsonResponse(data=select_table(table_id))


def add_row(request, table_id):
    try:
        table = Table.objects.get(pk=table_id)
    except Column.DoesNotExist:
        raise Http404("Table does not exist")

    row = Row.objects.create(table=table)
    row.save()

    columns = Column.objects.filter(table=table)

    # Создаем пустые ячейки строки.
    for column in columns:
        Data.objects.create(row=row, column=column, value='').save()

    return JsonResponse(data=select_table(table_id))


def add_column(request, table_id):
    try:
        table = Table.objects.get(pk=table_id)
    except Column.DoesNotExist:
        raise Http404("Table does not exist")
    column_name = request.POST['column_name']

    column = Column.objects.create(name=column_name, table=table, order=0)
    column.save()

    rows = Row.objects.filter(table=table)

    for row in rows:
        Data.objects.create(row=row, column=column, value='').save()

    return JsonResponse(data=select_table(table_id))


def delete_row(request, table_id):
    row_id = request.POST['row_id']
    Row.objects.get(pk=row_id).delete()
    return JsonResponse(data=select_table(table_id))


def edit_cell(request, table_id):
    cell_id = request.POST['cell_id']
    new_value = request.POST['value']
    data = Data.objects.get(pk=cell_id)
    data.value = new_value
    data.save()
    return JsonResponse(data=select_table(table_id))


def delete_column(request, table_id):
    column_id = request.POST['column_id']
    Column.objects.get(pk=column_id).delete()
    return JsonResponse(data=select_table(table_id))


def edit_column_name(request, table_id):
    column_id = request.POST['column_id']
    new_column_name = request.POST['name']
    column = Column.objects.get(pk=column_id)
    column.name = new_column_name
    column.save()
    return JsonResponse(data=select_table(table_id))
