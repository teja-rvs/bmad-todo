# frozen_string_literal: true

require "test_helper"

class TasksEdgeCasesTest < ActionDispatch::IntegrationTest
  test "GET /tasks returns tasks ordered by created_at ascending" do
    old = Task.create!(title: "Oldest", completed: false, created_at: 2.days.ago)
    mid = Task.create!(title: "Middle", completed: false, created_at: 1.day.ago)
    newest = Task.create!(title: "Newest", completed: false, created_at: Time.current)

    get "/tasks"
    assert_response :success

    json = response.parsed_body
    ids = json["tasks"].map { |t| t["id"] }
    assert_equal [ old.id, mid.id, newest.id ], ids
  end

  test "POST /tasks with exactly 255-character title returns 201" do
    title = "x" * 255
    post "/tasks", params: { title: title }, as: :json
    assert_response :created
    assert_equal 255, response.parsed_body["title"].length
  end

  test "GET /tasks response contains only allowed fields" do
    Task.create!(title: "Field check", completed: false)
    get "/tasks"
    assert_response :success

    task_json = response.parsed_body["tasks"].first
    allowed = %w[id title completed created_at updated_at]
    assert_equal allowed.sort, task_json.keys.sort
  end

  test "POST /tasks response contains only allowed fields" do
    post "/tasks", params: { title: "Field check" }, as: :json
    assert_response :created

    allowed = %w[id title completed created_at updated_at]
    assert_equal allowed.sort, response.parsed_body.keys.sort
  end

  test "POST /tasks with unicode title returns 201 and preserves characters" do
    post "/tasks", params: { title: "Tâche à faire 日本語 🎉" }, as: :json
    assert_response :created
    assert_equal "Tâche à faire 日本語 🎉", response.parsed_body["title"]
  end

  test "POST /tasks with HTML in title stores as plain text (no XSS)" do
    post "/tasks", params: { title: '<script>alert("xss")</script>' }, as: :json
    assert_response :created
    assert_equal '<script>alert("xss")</script>', response.parsed_body["title"]

    get "/tasks"
    task = response.parsed_body["tasks"].find { |t| t["title"].include?("script") }
    assert task
    assert_equal '<script>alert("xss")</script>', task["title"]
  end

  test "POST /tasks with leading/trailing whitespace title preserves whitespace" do
    post "/tasks", params: { title: "  Spacey task  " }, as: :json
    assert_response :created
    assert_equal "  Spacey task  ", response.parsed_body["title"]
  end

  test "DELETE /tasks/:id is not a recognized route" do
    task = Task.create!(title: "Cannot delete", completed: false)
    delete "/tasks/#{task.id}"
    assert_includes [ 404, 405 ], response.status
  end

  test "PATCH /tasks/:id does not allow title update (only completed)" do
    task = Task.create!(title: "Original title", completed: false)
    patch "/tasks/#{task.id}", params: { title: "Hacked title", completed: true }, as: :json
    assert_response :ok

    task.reload
    assert_equal "Original title", task.title
    assert_equal true, task.completed
  end

  test "POST /tasks with extra params ignores them (mass assignment protection)" do
    post "/tasks", params: { title: "Safe task", completed: true, id: 99999 }, as: :json
    assert_response :created

    json = response.parsed_body
    assert_equal "Safe task", json["title"]
    assert_equal false, json["completed"]
    assert_not_equal 99999, json["id"]
  end

  test "GET /tasks returns empty array after all tasks are created and none match" do
    get "/tasks"
    assert_response :success
    assert_equal [], response.parsed_body["tasks"]
  end

  test "PATCH /tasks/:id with malformed JSON returns 400" do
    task = Task.create!(title: "Malformed", completed: false)
    patch "/tasks/#{task.id}", params: "{ invalid", headers: { "Content-Type" => "application/json" }
    assert_response :bad_request
    assert_equal 400, response.status
  end
end
