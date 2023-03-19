from django.db import models


class Table(models.Model):
    name = models.CharField(max_length=100)


class Column(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    order = models.IntegerField()  # Вынести эту колонку. Порядок должен задаваться представлениями.


class Row(models.Model):
    table = models.ForeignKey(Table, on_delete=models.CASCADE)


class Data(models.Model):
    column = models.ForeignKey(Column, on_delete=models.CASCADE)
    row = models.ForeignKey(Row, on_delete=models.CASCADE)
    value = models.CharField(max_length=1000)


class Document(models.Model):
    row = models.ForeignKey(Row, on_delete=models.CASCADE)
    content = models.CharField(max_length=1000)
