from os import path
import setuptools

this_directory = path.abspath(path.dirname(__file__))
with open(path.join(this_directory, 'README.md'), encoding='utf-8') as f:
    long_description = f.read()

setuptools.setup(
    name='simple_api_admin',
    version='0.64',
    packages=setuptools.find_packages(),
	include_package_data=True,
    url='https://github.com/ladal1/simple_api_admin',
    license='MIT',
    author='Ladislav Louka',
    author_email='ladislav.louka@gmail.com',
    description='Basic web manager for Simple API generated service',
	long_description=long_description,
    long_description_content_type='text/markdown',
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    install_requires=[
        "django>=3.0.14"
    ],
    python_requires='>=3.6',
)
