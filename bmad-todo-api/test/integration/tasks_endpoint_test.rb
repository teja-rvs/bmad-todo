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
end
