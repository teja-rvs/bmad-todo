# frozen_string_literal: true

require "test_helper"

class TasksEndpointTest < ActionDispatch::IntegrationTest
  test "GET /tasks returns 200 and empty tasks array when no tasks" do
    get "/tasks"
    assert_response :success
    assert_equal 200, response.status

    json = response.parsed_body
    assert_equal({ "tasks" => [] }, json)
  end

  test "GET /tasks returns 200 and tasks array with snake_case keys when tasks exist" do
    task1 = Task.create!(title: "First task", completed: false)
    task2 = Task.create!(title: "Second task", completed: true)

    get "/tasks"
    assert_response :success
    assert_equal 200, response.status

    json = response.parsed_body
    assert json.key?("tasks")
    assert_equal 2, json["tasks"].size

    first = json["tasks"].find { |t| t["id"] == task1.id }
    assert first
    assert_equal "First task", first["title"]
    assert_equal false, first["completed"]
    assert first.key?("created_at")
    assert first.key?("updated_at")

    second = json["tasks"].find { |t| t["id"] == task2.id }
    assert second
    assert_equal "Second task", second["title"]
    assert_equal true, second["completed"]
  end

  test "GET /tasks returns CORS header for frontend origin" do
    get "/tasks", headers: { "Origin" => "http://localhost:5173" }
    assert_response :success
    assert_equal "http://localhost:5173", response.headers["Access-Control-Allow-Origin"]
  end

  test "POST /tasks returns CORS header for frontend origin" do
    post "/tasks", params: { title: "CORS check" }, as: :json, headers: { "Origin" => "http://localhost:5173" }
    assert_equal "http://localhost:5173", response.headers["Access-Control-Allow-Origin"]
  end

  test "PATCH /tasks/:id returns CORS header for frontend origin" do
    task = Task.create!(title: "CORS PATCH", completed: false)
    patch "/tasks/#{task.id}", params: { completed: true }, as: :json, headers: { "Origin" => "http://localhost:5173" }
    assert_response :ok
    assert_equal "http://localhost:5173", response.headers["Access-Control-Allow-Origin"]
  end

  test "POST /tasks with valid title returns 201 and created task with snake_case keys" do
    post "/tasks", params: { title: "New task" }, as: :json
    assert_response :created
    assert_equal 201, response.status

    json = response.parsed_body
    assert json.key?("id")
    assert_equal "New task", json["title"]
    assert_equal false, json["completed"]
    assert json.key?("created_at")
    assert json.key?("updated_at")

    task = Task.find(json["id"])
    assert_equal "New task", task.title
    assert_equal false, task.completed
  end

  test "POST /tasks with blank title returns 422 and error body" do
    post "/tasks", params: { title: "" }, as: :json
    assert_response :unprocessable_entity
    assert_equal 422, response.status

    json = response.parsed_body
    assert json.key?("error")
    assert_match(/blank|can't be blank/i, json["error"])
  end

  test "POST /tasks with title over 255 chars returns 422 and error body" do
    post "/tasks", params: { title: "x" * 256 }, as: :json
    assert_response :unprocessable_entity
    assert_equal 422, response.status

    json = response.parsed_body
    assert json.key?("error")
    assert_match(/too long|maximum|255/i, json["error"])
  end

  test "POST /tasks with missing title returns 422 and error body" do
    post "/tasks", params: {}, as: :json
    assert_response :unprocessable_entity
    assert_equal 422, response.status

    json = response.parsed_body
    assert json.key?("error")
  end

  test "POST /tasks with null title returns 422 and error body" do
    post "/tasks", params: { title: nil }, as: :json
    assert_response :unprocessable_entity
    assert_equal 422, response.status

    json = response.parsed_body
    assert json.key?("error")
    assert_match(/blank|can't be blank/i, json["error"])
  end

  test "POST /tasks with numeric title coerces to string and returns 201" do
    post "/tasks", params: { title: 123 }, as: :json
    assert_response :created
    assert_equal 201, response.status

    json = response.parsed_body
    assert_equal "123", json["title"]
  end

  test "POST /tasks with malformed JSON returns 400" do
    post "/tasks", params: "{ invalid", headers: { "Content-Type" => "application/json" }
    assert_response :bad_request
    assert_equal 400, response.status
  end

  test "PATCH /tasks/:id with valid id and completed true returns 200 and updated task with completed true" do
    task = Task.create!(title: "To complete", completed: false)
    patch "/tasks/#{task.id}", params: { completed: true }, as: :json
    assert_response :ok
    assert_equal 200, response.status

    json = response.parsed_body
    assert_equal task.id, json["id"]
    assert_equal "To complete", json["title"]
    assert_equal true, json["completed"]
    assert json.key?("created_at")
    assert json.key?("updated_at")

    task.reload
    assert_equal true, task.completed
  end

  test "PATCH /tasks/:id with valid id and completed false returns 200 and updated task with completed false" do
    task = Task.create!(title: "To uncomplete", completed: true)
    patch "/tasks/#{task.id}", params: { completed: false }, as: :json
    assert_response :ok
    assert_equal 200, response.status

    json = response.parsed_body
    assert_equal task.id, json["id"]
    assert_equal "To uncomplete", json["title"]
    assert_equal false, json["completed"]

    task.reload
    assert_equal false, task.completed
  end

  test "PATCH /tasks/:id with non-existent id returns 404 and error body" do
    non_existent_id = (Task.maximum(:id) || 0) + 99_999
    patch "/tasks/#{non_existent_id}", params: { completed: true }, as: :json
    assert_response :not_found
    assert_equal 404, response.status

    json = response.parsed_body
    assert json.key?("error")
    assert_equal "Task not found", json["error"]
  end

  test "PATCH /tasks/:id with invalid id format returns 404" do
    patch "/tasks/abc", params: { completed: true }, as: :json
    assert_response :not_found
    assert_equal 404, response.status
    json = response.parsed_body
    assert json.key?("error")
    assert_equal "Task not found", json["error"]
  end

  test "PATCH /tasks/:id with empty body returns 200 and unchanged task" do
    task = Task.create!(title: "Unchanged", completed: false)
    patch "/tasks/#{task.id}", params: {}, as: :json
    assert_response :ok
    assert_equal 200, response.status
    json = response.parsed_body
    assert_equal task.id, json["id"]
    assert_equal false, json["completed"]
    task.reload
    assert_equal false, task.completed
  end

  test "PATCH /tasks/:id with string completed true coerces to boolean" do
    task = Task.create!(title: "Coerce", completed: false)
    patch "/tasks/#{task.id}", params: { completed: "true" }, as: :json
    assert_response :ok
    assert_equal 200, response.status
    json = response.parsed_body
    assert_equal true, json["completed"]
    task.reload
    assert_equal true, task.completed
  end
end
