if (exists(select * from sys.columns where object_id = object_id('dbo.todos') and [name] = 'order'))
begin
    select * into #todos_order from dbo.todos;
    truncate table dbo.todos;
end
