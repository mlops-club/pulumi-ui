from projen.python import PythonProject

project = PythonProject(
    author_email="eric.riddoch@gmail.com",
    author_name="phitoduck",
    module_name="pulumi_ui",
    name="pulumi-ui",
    version="0.1.0",
)

project.synth()