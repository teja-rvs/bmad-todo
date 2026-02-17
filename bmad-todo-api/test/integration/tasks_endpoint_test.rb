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

  test "POST /tasks returns 404 when route does not exist" do
    post "/tasks", params: { task: { title: "New task" } }
    assert_response :not_found
    assert_equal 404, response.status
  end
end
